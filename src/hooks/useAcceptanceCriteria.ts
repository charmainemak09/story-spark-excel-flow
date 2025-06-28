
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAcceptanceCriteria = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAcceptanceCriteriaMutation = useMutation({
    mutationFn: async ({ userStoryId, given, when, then }: { userStoryId: string; given: string; when: string; then: string }) => {
      const { data, error } = await supabase
        .from('acceptance_criteria')
        .insert([{
          user_story_id: userStoryId,
          given_condition: given,
          when_action: when,
          then_result: then
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "Acceptance criteria created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create acceptance criteria",
        variant: "destructive",
      });
    }
  });

  const updateAcceptanceCriteriaMutation = useMutation({
    mutationFn: async ({ id, userStoryId, given, when, then }: { id: string; userStoryId?: string; given: string; when: string; then: string }) => {
      const updateData: any = {
        given_condition: given,
        when_action: when,
        then_result: then
      };
      
      if (userStoryId) {
        updateData.user_story_id = userStoryId;
      }
      
      const { data, error } = await supabase
        .from('acceptance_criteria')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "Acceptance criteria updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update acceptance criteria",
        variant: "destructive",
      });
    }
  });

  const deleteAcceptanceCriteriaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('acceptance_criteria')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "Acceptance criteria deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete acceptance criteria",
        variant: "destructive",
      });
    }
  });

  return {
    createAcceptanceCriteria: createAcceptanceCriteriaMutation.mutate,
    updateAcceptanceCriteria: updateAcceptanceCriteriaMutation.mutate,
    deleteAcceptanceCriteria: deleteAcceptanceCriteriaMutation.mutate,
    isCreating: createAcceptanceCriteriaMutation.isPending,
    isUpdating: updateAcceptanceCriteriaMutation.isPending,
    isDeleting: deleteAcceptanceCriteriaMutation.isPending
  };
};
