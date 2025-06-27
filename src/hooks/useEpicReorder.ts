
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useEpicReorder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reorderEpicsMutation = useMutation({
    mutationFn: async ({ themeId, epicIds }: { themeId: string; epicIds: string[] }) => {
      // Update each epic with its new position
      const updates = epicIds.map((epicId, index) => 
        supabase
          .from('epics')
          .update({ order_position: index } as any)
          .eq('id', epicId)
      );

      const results = await Promise.all(updates);
      
      // Check if any update failed
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: (error) => {
      console.error('Epic reorder error:', error);
      toast({
        title: "Error",
        description: "Failed to reorder epics",
        variant: "destructive",
      });
    }
  });

  return {
    reorderEpics: reorderEpicsMutation.mutate,
    isReordering: reorderEpicsMutation.isPending
  };
};
