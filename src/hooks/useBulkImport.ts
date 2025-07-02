
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
    
    // Parse "Given [condition], When [action], Then [result]" format
    const givenMatch = criteria.match(/Given\s+(.+?)(?=,\s*When|$)/i);
    const whenMatch = criteria.match(/When\s+(.+?)(?=,\s*Then|$)/i);
    const thenMatch = criteria.match(/Then\s+(.+?)$/i);

    const result = {
      given: givenMatch ? givenMatch[1].trim() : 'condition is met',
      when: whenMatch ? whenMatch[1].trim() : 'action is performed',
      then: thenMatch ? thenMatch[1].trim() : 'result is achieved'
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
            console.log('Creating acceptance criteria:', item.acceptanceCriteria);
            const parsedCriteria = parseAcceptanceCriteria(item.acceptanceCriteria.trim());

            const { error: criteriaError } = await supabase
              .from('acceptance_criteria')
              .insert([{
                user_story_id: newUserStory.id,
                given_condition: parsedCriteria.given,
                when_action: parsedCriteria.when,
                then_result: parsedCriteria.then
              }]);

            if (criteriaError) {
              console.error('Error creating acceptance criteria:', criteriaError);
              // Don't throw here, just log the error and continue
            } else {
              console.log('Created acceptance criteria successfully');
            }
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
