
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAcceptanceCriteriaReorder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reorderCriteriaMutation = useMutation({
    mutationFn: async ({ userStoryId, criteriaIds }: { userStoryId: string; criteriaIds: string[] }) => {
      const updates = criteriaIds.map((criteriaId, index) => 
        supabase
          .from('acceptance_criteria')
          .update({ order_position: index } as any)
          .eq('id', criteriaId)
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
      console.error('Acceptance criteria reorder error:', error);
      toast({
        title: "Error",
        description: "Failed to reorder acceptance criteria",
        variant: "destructive",
      });
    }
  });

  return {
    reorderCriteria: reorderCriteriaMutation.mutate,
    isReordering: reorderCriteriaMutation.isPending
  };
};
