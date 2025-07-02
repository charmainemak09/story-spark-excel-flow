
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

      // Get existing user stories for duplicate detection
      const { data: existingUserStories } = await supabase
        .from('user_stories')
        .select('user_role, action, result, epic_id')
        .in('epic_id', existingEpics?.map(e => e.id) || []);

      console.log('Existing user stories:', existingUserStories);

      for (const [index, item] of importData.entries()) {
        try {
          console.log(`Processing item ${index + 1}/${totalRows}:`, item);
          
          // Find or create epic
          let epic = existingEpics?.find(e => 
            e.title.toLowerCase().trim() === item.epic.toLowerCase().trim()
          );

          if (!epic) {
            console.log('Creating new epic:', item.epic);
            const { data: newEpic, error: epicError } = await supabase
              .from('epics')
              .insert([{
                theme_id: themeId,
                title: item.epic.trim()
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

          // Check for duplicate user story
          const isDuplicate = existingUserStories?.some(us => 
            us.epic_id === epic?.id &&
            us.user_role.toLowerCase().trim() === item.userStory.toLowerCase().trim() &&
            us.action.toLowerCase().trim() === item.action.toLowerCase().trim() &&
            us.result.toLowerCase().trim() === item.result.toLowerCase().trim()
          );

          if (isDuplicate) {
            console.log('Skipping duplicate user story:', item);
            duplicatesSkipped++;
            continue;
          }

          // Create user story
          console.log('Creating user story for epic:', epic.id);
          const { data: newUserStory, error: userStoryError } = await supabase
            .from('user_stories')
            .insert([{
              epic_id: epic.id,
              user_role: item.userStory.trim(),
              action: item.action.trim(),
              result: item.result.trim()
            }])
            .select()
            .single();

          if (userStoryError) {
            console.error('Error creating user story:', userStoryError);
            throw userStoryError;
          }

          console.log('Created user story:', newUserStory);

          // Add to existing user stories for duplicate detection
          existingUserStories?.push({
            user_role: item.userStory.trim(),
            action: item.action.trim(),
            result: item.result.trim(),
            epic_id: epic.id
          });

          newUserStories++;

          // Create acceptance criteria if provided
          if (item.acceptanceCriteria && item.acceptanceCriteria.trim()) {
            console.log('Processing acceptance criteria:', item.acceptanceCriteria);
            const parsedCriteria = parseAcceptanceCriteria(item.acceptanceCriteria.trim());

            if (parsedCriteria) {
              console.log('Creating acceptance criteria with parsed data:', parsedCriteria);
              const { data: newCriteria, error: criteriaError } = await supabase
                .from('acceptance_criteria')
                .insert([{
                  user_story_id: newUserStory.id,
                  given_condition: parsedCriteria.given,
                  when_action: parsedCriteria.when,
                  then_result: parsedCriteria.then
                }])
                .select()
                .single();

              if (criteriaError) {
                console.error('Error creating acceptance criteria:', criteriaError);
                console.error('Attempted to insert:', {
                  user_story_id: newUserStory.id,
                  given_condition: parsedCriteria.given,
                  when_action: parsedCriteria.when,
                  then_result: parsedCriteria.then
                });
              } else {
                console.log('Successfully created acceptance criteria:', newCriteria);
              }
            } else {
              console.log('Skipping acceptance criteria - parsing returned null');
            }
          } else {
            console.log('No acceptance criteria provided for this user story');
          }

        } catch (error) {
          console.error('Error processing row:', item, error);
          // Continue processing other rows even if one fails
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
