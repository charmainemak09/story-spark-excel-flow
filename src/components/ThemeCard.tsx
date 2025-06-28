import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { Theme } from '@/types/userStory';
import { EpicCard } from './EpicCard';
import { AddEpicDialog } from './AddEpicDialog';
import { EditThemeDialog } from './EditThemeDialog';
import { useEpicReorder } from '@/hooks/useEpicReorder';
import { useUserStories } from '@/hooks/useUserStories';
import { useAcceptanceCriteria } from '@/hooks/useAcceptanceCriteria';
import { BulkImportDialog } from './BulkImportDialog';
import { useBulkImport } from '@/hooks/useBulkImport';

interface ThemeCardProps {
  theme: Theme;
  onUpdate: (theme: Theme) => void;
  onDelete: (themeId: string) => void;
  onAddEpic?: (title: string) => void;
  onUpdateEpic?: (epicId: string, title: string) => void;
  onDeleteEpic?: (epicId: string) => void;
  onAddUserStory?: (epicId: string, user: string, action: string, result: string) => void;
  onUpdateUserStory?: (storyId: string, user: string, action: string, result: string) => void;
  onDeleteUserStory?: (storyId: string) => void;
  onAddAcceptanceCriteria?: (userStoryId: string, given: string, when: string, then: string) => void;
  onUpdateAcceptanceCriteria?: (criteriaId: string, given: string, when: string, then: string) => void;
  onDeleteAcceptanceCriteria?: (criteriaId: string) => void;
}

export const ThemeCard = ({ 
  theme, 
  onUpdate, 
  onDelete, 
  onAddEpic,
  onUpdateEpic,
  onDeleteEpic,
  onAddUserStory,
  onUpdateUserStory,
  onDeleteUserStory,
  onAddAcceptanceCriteria,
  onUpdateAcceptanceCriteria,
  onDeleteAcceptanceCriteria
}: ThemeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddEpicOpen, setIsAddEpicOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { reorderEpics } = useEpicReorder();
  const { updateUserStory } = useUserStories();
  const { updateAcceptanceCriteria } = useAcceptanceCriteria();
  const { bulkImport } = useBulkImport(theme.id);

  const addEpic = (title: string) => {
    if (onAddEpic) {
      onAddEpic(title);
    } else {
      const newEpic = {
        id: Date.now().toString(),
        title,
        userStories: []
      };
      onUpdate({
        ...theme,
        epics: [...theme.epics, newEpic]
      });
    }
  };

  const updateEpic = (updatedEpic: any) => {
    if (onUpdateEpic) {
      onUpdateEpic(updatedEpic.id, updatedEpic.title);
    } else {
      onUpdate({
        ...theme,
        epics: theme.epics.map(epic => 
          epic.id === updatedEpic.id ? updatedEpic : epic
        )
      });
    }
  };

  const deleteEpic = (epicId: string) => {
    if (onDeleteEpic) {
      onDeleteEpic(epicId);
    } else {
      onUpdate({
        ...theme,
        epics: theme.epics.filter(epic => epic.id !== epicId)
      });
    }
  };

  const updateTheme = (title: string, description: string) => {
    onUpdate({
      ...theme,
      title,
      description
    });
  };

  const handleEpicReorder = (draggedEpicId: string, targetEpicId: string) => {
    const epics = [...theme.epics];
    const draggedIndex = epics.findIndex(e => e.id === draggedEpicId);
    const targetIndex = epics.findIndex(e => e.id === targetEpicId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedEpic] = epics.splice(draggedIndex, 1);
      epics.splice(targetIndex, 0, draggedEpic);
      
      // Update local state immediately for better UX
      onUpdate({
        ...theme,
        epics
      });

      // Update database order
      const epicIds = epics.map(epic => epic.id);
      reorderEpics({ themeId: theme.id, epicIds });
    }
  };

  const handleUserStoryMove = (storyId: string, targetEpicId: string) => {
    console.log('Moving user story:', storyId, 'to epic:', targetEpicId);
    
    // Find the story in the current theme
    let sourceEpicId = '';
    let storyToMove = null;
    
    for (const epic of theme.epics) {
      const story = epic.userStories.find(s => s.id === storyId);
      if (story) {
        sourceEpicId = epic.id;
        storyToMove = story;
        break;
      }
    }
    
    if (!storyToMove || sourceEpicId === targetEpicId) return;
    
    // Update local state
    const updatedEpics = theme.epics.map(epic => {
      if (epic.id === sourceEpicId) {
        // Remove story from source epic
        return {
          ...epic,
          userStories: epic.userStories.filter(s => s.id !== storyId)
        };
      } else if (epic.id === targetEpicId) {
        // Add story to target epic
        return {
          ...epic,
          userStories: [...epic.userStories, storyToMove]
        };
      }
      return epic;
    });
    
    onUpdate({
      ...theme,
      epics: updatedEpics
    });
    
    // Update database
    updateUserStory({ 
      id: storyId, 
      epicId: targetEpicId,
      user: storyToMove.user, 
      action: storyToMove.action, 
      result: storyToMove.result 
    });
  };

  const handleAcceptanceCriteriaMove = (criteriaId: string, targetUserStoryId: string) => {
    console.log('Moving acceptance criteria:', criteriaId, 'to user story:', targetUserStoryId);
    
    // Find the criteria in the current theme
    let sourceUserStoryId = '';
    let criteriaToMove = null;
    
    for (const epic of theme.epics) {
      for (const story of epic.userStories) {
        const criteria = story.acceptanceCriteria.find(c => c.id === criteriaId);
        if (criteria) {
          sourceUserStoryId = story.id;
          criteriaToMove = criteria;
          break;
        }
      }
      if (criteriaToMove) break;
    }
    
    if (!criteriaToMove || sourceUserStoryId === targetUserStoryId) return;
    
    // Update local state
    const updatedEpics = theme.epics.map(epic => ({
      ...epic,
      userStories: epic.userStories.map(story => {
        if (story.id === sourceUserStoryId) {
          // Remove criteria from source story
          return {
            ...story,
            acceptanceCriteria: story.acceptanceCriteria.filter(c => c.id !== criteriaId)
          };
        } else if (story.id === targetUserStoryId) {
          // Add criteria to target story
          return {
            ...story,
            acceptanceCriteria: [...story.acceptanceCriteria, criteriaToMove]
          };
        }
        return story;
      })
    }));
    
    onUpdate({
      ...theme,
      epics: updatedEpics
    });
    
    // Update database
    updateAcceptanceCriteria({ 
      id: criteriaId, 
      userStoryId: targetUserStoryId,
      given: criteriaToMove.given, 
      when: criteriaToMove.when, 
      then: criteriaToMove.then 
    });
  };

  const totalUserStories = theme.epics.reduce((total, epic) => total + epic.userStories.length, 0);

  const handleBulkImport = async (importData: any[]) => {
    return await new Promise<any>((resolve) => {
      bulkImport(importData, {
        onSuccess: (result) => resolve(result),
        onError: () => resolve({ totalRows: 0, newUserStories: 0, duplicatesSkipped: 0 })
      });
    });
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl text-blue-900">{theme.title}</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {theme.epics.length} Epic{theme.epics.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {totalUserStories} User Stor{totalUserStories !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>
            <CardDescription className="text-blue-700 whitespace-pre-wrap">{theme.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(theme.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setIsBulkImportOpen(true)}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-100"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Epics</h3>
            <Button
              onClick={() => setIsAddEpicOpen(true)}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Epic
            </Button>
          </div>

          {theme.epics.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No epics in this theme yet</p>
              <Button
                onClick={() => setIsAddEpicOpen(true)}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Epic
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {theme.epics.map((epic) => (
                <EpicCard
                  key={epic.id}
                  epic={epic}
                  onUpdate={updateEpic}
                  onDelete={deleteEpic}
                  onReorder={handleEpicReorder}
                  onAddUserStory={onAddUserStory}
                  onUpdateUserStory={onUpdateUserStory}
                  onDeleteUserStory={onDeleteUserStory}
                  onAddAcceptanceCriteria={onAddAcceptanceCriteria}
                  onUpdateAcceptanceCriteria={onUpdateAcceptanceCriteria}
                  onDeleteAcceptanceCriteria={onDeleteAcceptanceCriteria}
                  onUserStoryMove={handleUserStoryMove}
                  onAcceptanceCriteriaMove={handleAcceptanceCriteriaMove}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <AddEpicDialog
        open={isAddEpicOpen}
        onOpenChange={setIsAddEpicOpen}
        onAdd={addEpic}
      />

      <EditThemeDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        theme={theme}
        onUpdate={updateTheme}
      />

      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImport={handleBulkImport}
      />
    </Card>
  );
};
