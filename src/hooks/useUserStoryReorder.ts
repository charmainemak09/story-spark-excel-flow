
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useUserStoryReorder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reorderUserStoriesMutation = useMutation({
    mutationFn: async ({ epicId, storyIds }: { epicId: string; storyIds: string[] }) => {
      const updates = storyIds.map((storyId, index) => 
        supabase
          .from('user_stories')
          .update({ order_position: index } as any)
          .eq('id', storyId)
      );

      const results = await Promise.all(updates);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: (error) => {
      console.error('User story reorder error:', error);
      toast({
        title: "Error",
        description: "Failed to reorder user stories",
        variant: "destructive",
      });
    }
  });

  return {
    reorderUserStories: reorderUserStoriesMutation.mutate,
    isReordering: reorderUserStoriesMutation.isPending
  };
};
