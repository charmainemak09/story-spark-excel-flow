
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Theme } from '@/types/userStory';
import { useToast } from './use-toast';

export const useThemes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: themes = [], isLoading, error } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('themes')
        .select(`
          *,
          epics (
            *,
            user_stories (
              *,
              acceptance_criteria (*)
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(theme => ({
        id: theme.id,
        title: theme.title,
        description: theme.description || '',
        epics: theme.epics.map(epic => ({
          id: epic.id,
          title: epic.title,
          userStories: epic.user_stories.map(story => ({
            id: story.id,
            user: story.user_role,
            action: story.action,
            result: story.result,
            acceptanceCriteria: story.acceptance_criteria.map(criteria => ({
              id: criteria.id,
              given: criteria.given_condition,
              when: criteria.when_action,
              then: criteria.then_result
            }))
          }))
        }))
      })) as Theme[];
    },
    enabled: !!user
  });

  const createThemeMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('themes')
        .insert([{
          title,
          description,
          user_id: user.id
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
        description: "Theme created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create theme",
        variant: "destructive",
      });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title: string; description: string }) => {
      const { data, error } = await supabase
        .from('themes')
        .update({ title, description })
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
        description: "Theme updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      toast({
        title: "Success",
        description: "Theme deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete theme",
        variant: "destructive",
      });
    }
  });

  return {
    themes,
    isLoading,
    error,
    createTheme: createThemeMutation.mutate,
    updateTheme: updateThemeMutation.mutate,
    deleteTheme: deleteThemeMutation.mutate,
    isCreating: createThemeMutation.isPending,
    isUpdating: updateThemeMutation.isPending,
    isDeleting: deleteThemeMutation.isPending
  };
};
