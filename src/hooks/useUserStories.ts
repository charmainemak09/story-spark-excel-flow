
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useUserStories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createUserStoryMutation = useMutation({
    mutationFn: async ({ epicId, user, action, result }: { epicId: string; user: string; action: string; result: string }) => {
      const { data, error } = await supabase
        .from('user_stories')
        .insert([{
          epic_id: epicId,
          user_role: user,
          action,
          result
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
        description: "User story created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user story",
        variant: "destructive",
      });
    }
  });

  const updateUserStoryMutation = useMutation({
    mutationFn: async ({ id, epicId, user, action, result }: { id: string; epicId?: string; user: string; action: string; result: string }) => {
      const updateData: any = {
        user_role: user,
        action,
        result
      };
      
      if (epicId) {
        updateData.epic_id = epicId;
      }
      
      const { data, error } = await supabase
        .from('user_stories')
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
        description: "User story updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user story",
        variant: "destructive",
      });
    }
  });

  const deleteUserStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_stories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "User story deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user story",
        variant: "destructive",
      });
    }
  });

  return {
    createUserStory: createUserStoryMutation.mutate,
    updateUserStory: updateUserStoryMutation.mutate,
    deleteUserStory: deleteUserStoryMutation.mutate,
    isCreating: createUserStoryMutation.isPending,
    isUpdating: updateUserStoryMutation.isPending,
    isDeleting: deleteUserStoryMutation.isPending
  };
};
