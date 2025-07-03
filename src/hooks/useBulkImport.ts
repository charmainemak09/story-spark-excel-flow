
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ImportData {
  epic: string;
  userStory: string;
  action: string;
  result: string;
  acceptanceCriteria?: string;
}

interface ImportResult {
  totalRows: number;
  newUserStories: number;
  duplicatesSkipped: number;
}

export const useBulkImport = (themeId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const parseAcceptanceCriteria = (criteria: string) => {
    console.log('Parsing acceptance criteria:', criteria);
    
    if (!criteria || criteria.trim() === '') {
      console.log('No acceptance criteria provided');
      return null;
    }

    const trimmedCriteria = criteria.trim();
    
    // Enhanced regex to handle "Given..., When..., Then..." format with flexible punctuation
    const givenMatch = trimmedCriteria.match(/Given\s+([^,]+?)(?:,\s*When|$)/i);
    const whenMatch = trimmedCriteria.match(/When\s+([^,]+?)(?:,\s*Then|$)/i);
    const thenMatch = trimmedCriteria.match(/Then\s+(.+?)$/i);

    let given = 'condition is met';
    let when = 'action is performed'; 
    let then = 'result is achieved';

    if (givenMatch && givenMatch[1]) {
      given = givenMatch[1].trim();
    }
    if (whenMatch && whenMatch[1]) {
      when = whenMatch[1].trim();
    }
    if (thenMatch && thenMatch[1]) {
      then = thenMatch[1].trim();
    }

    // If none of the patterns match, try to extract meaningful parts or use the whole text as "then"
    if (!givenMatch && !whenMatch && !thenMatch) {
      console.log('No standard Given/When/Then format found, using entire text as Then clause');
      then = trimmedCriteria;
    }

    const result = {
      given,
      when,
      then
    };
    
    console.log('Parsed acceptance criteria:', result);
    return result;
  };

  const bulkImportMutation = useMutation({
    mutationFn: async (importData: ImportData[]): Promise<ImportResult> => {
      console.log('Starting bulk import with data:', importData);
      
      let newUserStories = 0;
      let duplicatesSkipped = 0;
      const totalRows = importData.length;

      // Get existing epics for this theme
      const { data: existingEpics } = await supabase
        .from('epics')
        .select('id, title')
        .eq('theme_id', themeId);

      console.log('Existing epics:', existingEpics);

      // Get existing user stories with their acceptance criteria for more accurate duplicate detection
      const { data: existingUserStories } = await supabase
        .from('user_stories')
        .select(`
          id,
          user_role, 
          action, 
          result, 
          epic_id,
          acceptance_criteria (
            given_condition,
            when_action,
            then_result
          )
        `)
        .in('epic_id', existingEpics?.map(e => e.id) || []);

      console.log('Existing user stories with acceptance criteria:', existingUserStories);

      // Group import data by user story (same epic, user, action, result)
      const groupedData = new Map<string, ImportData[]>();
      
      for (const item of importData) {
        const key = `${item.epic}|${item.userStory}|${item.action}|${item.result}`;
        if (!groupedData.has(key)) {
          groupedData.set(key, []);
        }
        groupedData.get(key)!.push(item);
      }

      console.log('Grouped data:', groupedData);

      for (const [groupKey, groupItems] of groupedData.entries()) {
        try {
          const firstItem = groupItems[0];
          console.log(`Processing group: ${groupKey} with ${groupItems.length} items`);
          
          // Find or create epic
          let epic = existingEpics?.find(e => 
            e.title.toLowerCase().trim() === firstItem.epic.toLowerCase().trim()
          );

          if (!epic) {
            console.log('Creating new epic:', firstItem.epic);
            const { data: newEpic, error: epicError } = await supabase
              .from('epics')
              .insert([{
                theme_id: themeId,
                title: firstItem.epic.trim()
              }])
              .select()
              .single();

            if (epicError) {
              console.error('Error creating epic:', epicError);
              throw epicError;
            }
            epic = newEpic;
            existingEpics?.push(epic);
            console.log('Created epic:', epic);
          }

          // Check if user story already exists
          const existingUserStory = existingUserStories?.find(us => 
            us.epic_id === epic?.id &&
            us.user_role.toLowerCase().trim() === firstItem.userStory.toLowerCase().trim() &&
            us.action.toLowerCase().trim() === firstItem.action.toLowerCase().trim() &&
            us.result.toLowerCase().trim() === firstItem.result.toLowerCase().trim()
          );

          let userStoryId: string;

          if (existingUserStory) {
            console.log('Found existing user story:', existingUserStory.id);
            userStoryId = existingUserStory.id;
          } else {
            // Create new user story
            console.log('Creating user story for epic:', epic.id);
            const { data: newUserStory, error: userStoryError } = await supabase
              .from('user_stories')
              .insert([{
                epic_id: epic.id,
                user_role: firstItem.userStory.trim(),
                action: firstItem.action.trim(),
                result: firstItem.result.trim()
              }])
              .select()
              .single();

            if (userStoryError) {
              console.error('Error creating user story:', userStoryError);
              throw userStoryError;
            }

            console.log('Created user story:', newUserStory);
            userStoryId = newUserStory.id;
            newUserStories++;

            // Add to existing user stories for tracking
            existingUserStories?.push({
              id: userStoryId,
              user_role: firstItem.userStory.trim(),
              action: firstItem.action.trim(),
              result: firstItem.result.trim(),
              epic_id: epic.id,
              acceptance_criteria: []
            });
          }

          // Process acceptance criteria for this user story
          for (const item of groupItems) {
            if (item.acceptanceCriteria && item.acceptanceCriteria.trim()) {
              const parsedCriteria = parseAcceptanceCriteria(item.acceptanceCriteria.trim());
              
              if (parsedCriteria) {
                // Check if this exact acceptance criteria already exists for this user story
                const existingCriteria = existingUserStory?.acceptance_criteria?.find(ac =>
                  ac.given_condition.toLowerCase().trim() === parsedCriteria.given.toLowerCase().trim() &&
                  ac.when_action.toLowerCase().trim() === parsedCriteria.when.toLowerCase().trim() &&
                  ac.then_result.toLowerCase().trim() === parsedCriteria.then.toLowerCase().trim()
                );

                if (existingCriteria) {
                  console.log('Skipping duplicate acceptance criteria:', parsedCriteria);
                  duplicatesSkipped++;
                  continue;
                }

                console.log('Creating acceptance criteria with parsed data:', parsedCriteria);
                const { data: newCriteria, error: criteriaError } = await supabase
                  .from('acceptance_criteria')
                  .insert([{
                    user_story_id: userStoryId,
                    given_condition: parsedCriteria.given,
                    when_action: parsedCriteria.when,
                    then_result: parsedCriteria.then
                  }])
                  .select()
                  .single();

                if (criteriaError) {
                  console.error('Error creating acceptance criteria:', criteriaError);
                } else {
                  console.log('Successfully created acceptance criteria:', newCriteria);
                }
              } else {
                console.log('Skipping acceptance criteria - parsing returned null');
              }
            } else {
              console.log('No acceptance criteria provided for this item');
            }
          }

        } catch (error) {
          console.error('Error processing group:', groupKey, error);
          // Continue processing other groups even if one fails
        }
      }

      const result = {
        totalRows,
        newUserStories,
        duplicatesSkipped
      };
      
      console.log('Bulk import completed:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: (error) => {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Error",
        description: "There was an error during the import process. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    bulkImport: bulkImportMutation.mutate,
    isBulkImporting: bulkImportMutation.isPending
  };
};
