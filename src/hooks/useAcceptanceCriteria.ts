
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAcceptanceCriteria = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAcceptanceCriteriaMutation = useMutation({
    mutationFn: async ({ userStoryId, given, when, then }: { 
      userStoryId: string; 
      given: string; 
      when: string; 
      then: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
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
    onError: (error) => {
      console.error('Acceptance criteria creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create acceptance criteria",
        variant: "destructive",
      });
    }
  });

  const updateAcceptanceCriteriaMutation = useMutation({
    mutationFn: async ({ id, given, when, then }: { 
      id: string; 
      given: string; 
      when: string; 
      then: string; 
    }) => {
      const { data, error } = await supabase
        .from('acceptance_criteria')
        .update({ 
          given_condition: given,
          when_action: when,
          then_result: then 
        })
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
