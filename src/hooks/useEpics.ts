
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useEpics = (themeId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEpicMutation = useMutation({
    mutationFn: async ({ themeId, title }: { themeId: string; title: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('epics')
        .insert([{
          theme_id: themeId,
          title
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
        description: "Epic created successfully",
      });
    },
    onError: (error) => {
      console.error('Epic creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create epic",
        variant: "destructive",
      });
    }
  });

  const updateEpicMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from('epics')
        .update({ title })
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
        description: "Epic updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update epic",
        variant: "destructive",
      });
    }
  });

  const deleteEpicMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('epics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "Epic deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete epic",
        variant: "destructive",
      });
    }
  });

  return {
    createEpic: createEpicMutation.mutate,
    updateEpic: updateEpicMutation.mutate,
    deleteEpic: deleteEpicMutation.mutate,
    isCreating: createEpicMutation.isPending,
    isUpdating: updateEpicMutation.isPending,
    isDeleting: deleteEpicMutation.isPending
  };
};
