
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

  const bulkImportMutation = useMutation({
    mutationFn: async (importData: ImportData[]): Promise<ImportResult> => {
      let newUserStories = 0;
      let duplicatesSkipped = 0;
      const totalRows = importData.length;

      // Get existing epics for this theme
      const { data: existingEpics } = await supabase
        .from('epics')
        .select('id, title')
        .eq('theme_id', themeId);

      // Get existing user stories for duplicate detection
      const { data: existingUserStories } = await supabase
        .from('user_stories')
        .select('user_role, action, result, epic_id')
        .in('epic_id', existingEpics?.map(e => e.id) || []);

      for (const item of importData) {
        try {
          // Find or create epic
          let epic = existingEpics?.find(e => 
            e.title.toLowerCase().trim() === item.epic.toLowerCase().trim()
          );

          if (!epic) {
            const { data: newEpic, error: epicError } = await supabase
              .from('epics')
              .insert([{
                theme_id: themeId,
                title: item.epic.trim()
              }])
              .select()
              .single();

            if (epicError) throw epicError;
            epic = newEpic;
            existingEpics?.push(epic);
          }

          // Check for duplicate user story
          const isDuplicate = existingUserStories?.some(us => 
            us.epic_id === epic?.id &&
            us.user_role.toLowerCase().trim() === item.userStory.toLowerCase().trim() &&
            us.action.toLowerCase().trim() === item.action.toLowerCase().trim() &&
            us.result.toLowerCase().trim() === item.result.toLowerCase().trim()
          );

          if (isDuplicate) {
            duplicatesSkipped++;
            continue;
          }

          // Create user story
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

          if (userStoryError) throw userStoryError;

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
            const criteria = item.acceptanceCriteria.trim();
            // Simple parsing - assumes format "Given X, When Y, Then Z"
            const parts = criteria.split(/,\s*(?=When|Then)/i);
            
            const given = parts.find(p => p.toLowerCase().startsWith('given'))?.replace(/^given\s+/i, '') || criteria;
            const when = parts.find(p => p.toLowerCase().startsWith('when'))?.replace(/^when\s+/i, '') || 'action is performed';
            const then = parts.find(p => p.toLowerCase().startsWith('then'))?.replace(/^then\s+/i, '') || 'result is achieved';

            await supabase
              .from('acceptance_criteria')
              .insert([{
                user_story_id: newUserStory.id,
                given_condition: given,
                when_action: when,
                then_result: then
              }]);
          }

        } catch (error) {
          console.error('Error processing row:', item, error);
          // Continue processing other rows even if one fails
        }
      }

      return {
        totalRows,
        newUserStories,
        duplicatesSkipped
      };
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
