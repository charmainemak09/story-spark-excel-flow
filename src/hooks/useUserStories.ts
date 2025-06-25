
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useUserStories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserStoryMutation = useMutation({
    mutationFn: async ({ epicId, user: userRole, action, result }: { 
      epicId: string; 
      user: string; 
      action: string; 
      result: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_stories')
        .insert([{
          epic_id: epicId,
          user_role: userRole,
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
    onError: (error) => {
      console.error('User story creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create user story",
        variant: "destructive",
      });
    }
  });

  const updateUserStoryMutation = useMutation({
    mutationFn: async ({ id, user: userRole, action, result }: { 
      id: string; 
      user: string; 
      action: string; 
      result: string; 
    }) => {
      const { data, error } = await supabase
        .from('user_stories')
        .update({ 
          user_role: userRole,
          action,
          result 
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
