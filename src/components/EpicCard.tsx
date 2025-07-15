import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Epic } from '@/types/userStory';
import { UserStoryCard } from './UserStoryCard';
import { AddUserStoryDialog } from './AddUserStoryDialog';
import { EditEpicDialog } from './EditEpicDialog';
import { useUserStoryReorder } from '@/hooks/useUserStoryReorder';

interface EpicCardProps {
  epic: Epic;
  onUpdate: (epic: Epic) => void;
  onDelete: (epicId: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
  onAddUserStory?: (epicId: string, user: string, action: string, result: string) => void;
  onUpdateUserStory?: (storyId: string, user: string, action: string, result: string) => void;
  onDeleteUserStory?: (storyId: string) => void;
  onAddAcceptanceCriteria?: (userStoryId: string, given: string, when: string, then: string) => void;
  onUpdateAcceptanceCriteria?: (criteriaId: string, given: string, when: string, then: string) => void;
  onDeleteAcceptanceCriteria?: (criteriaId: string) => void;
  onUserStoryMove?: (storyId: string, targetEpicId: string) => void;
  onAcceptanceCriteriaMove?: (criteriaId: string, targetUserStoryId: string) => void;
}

export const EpicCard = ({ 
  epic, 
  onUpdate, 
  onDelete, 
  onReorder,
  onAddUserStory,
  onUpdateUserStory,
  onDeleteUserStory,
  onAddAcceptanceCriteria,
  onUpdateAcceptanceCriteria,
  onDeleteAcceptanceCriteria,
  onUserStoryMove,
  onAcceptanceCriteriaMove
}: EpicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { reorderUserStories } = useUserStoryReorder();

  const addUserStory = (user: string, action: string, result: string) => {
    if (onAddUserStory) {
      onAddUserStory(epic.id, user, action, result);
    } else {
      const newUserStory = {
        id: Date.now().toString(),
        user,
        action,
        result,
        acceptanceCriteria: []
      };
      onUpdate({
        ...epic,
        userStories: [...epic.userStories, newUserStory]
      });
    }
  };

  const updateUserStory = (updatedUserStory: any) => {
    if (onUpdateUserStory) {
      onUpdateUserStory(updatedUserStory.id, updatedUserStory.user, updatedUserStory.action, updatedUserStory.result);
    } else {
      onUpdate({
        ...epic,
        userStories: epic.userStories.map(story => 
          story.id === updatedUserStory.id ? updatedUserStory : story
        )
      });
    }
  };

  const deleteUserStory = (storyId: string) => {
    if (onDeleteUserStory) {
      onDeleteUserStory(storyId);
    } else {
      onUpdate({
        ...epic,
        userStories: epic.userStories.filter(story => story.id !== storyId)
      });
    }
  };

  const updateEpic = (title: string) => {
    onUpdate({
      ...epic,
      title
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('Epic drag start:', epic.id);
    e.dataTransfer.setData('text/plain', epic.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'epic', id: epic.id }));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // Add visual feedback to drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const dragData = e.dataTransfer.getData('application/json');
      if (dragData) {
        const parsedData = JSON.parse(dragData);
        if (parsedData.type === 'epic' || parsedData.type === 'user-story') {
          e.dataTransfer.dropEffect = 'move';
          setIsDragOver(true);
          
          // Determine drop position based on mouse position
          const rect = e.currentTarget.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          setDragPosition(e.clientY < midpoint ? 'above' : 'below');
        }
      }
    } catch {
      // Fallback for plain text data
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      setDragPosition(e.clientY < midpoint ? 'above' : 'below');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || 
        e.clientY < rect.top || e.clientY > rect.bottom) {
      setIsDragOver(false);
      setDragPosition(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setIsDragOver(false);
    setDragPosition(null);
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragPosition(null);
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    try {
      const dragData = e.dataTransfer.getData('application/json');
      const parsedData = JSON.parse(dragData);
      
      if (parsedData.type === 'epic' && draggedId !== epic.id && onReorder) {
        console.log('Reordering epic:', draggedId, 'to', epic.id);
        onReorder(draggedId, epic.id);
      } else if (parsedData.type === 'user-story' && onUserStoryMove) {
        console.log('Moving user story:', draggedId, 'to epic:', epic.id);
        onUserStoryMove(draggedId, epic.id);
      }
    } catch {
      // Fallback for plain text data
      if (draggedId && draggedId !== epic.id && onReorder) {
        console.log('Fallback reordering epic:', draggedId, 'to', epic.id);
        onReorder(draggedId, epic.id);
      }
    }
  };

  const handleUserStoryReorder = (draggedStoryId: string, targetStoryId: string) => {
    console.log('Reordering user stories:', draggedStoryId, 'to', targetStoryId);
    const stories = [...epic.userStories];
    const draggedIndex = stories.findIndex(s => s.id === draggedStoryId);
    const targetIndex = stories.findIndex(s => s.id === targetStoryId);
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      const [draggedStory] = stories.splice(draggedIndex, 1);
      stories.splice(targetIndex, 0, draggedStory);
      
      // Update local state immediately
      onUpdate({
        ...epic,
        userStories: stories
      });

      // Update database order
      const storyIds = stories.map(story => story.id);
      reorderUserStories({ epicId: epic.id, storyIds });
    }
  };

  return (
    <div className="relative">
      {/* Drop indicator above */}
      {isDragOver && dragPosition === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-lg z-10">
          <div className="absolute left-2 -top-1 w-2 h-2 bg-primary rounded-full"></div>
        </div>
      )}
      
      <Card 
        className={`border-primary/20 bg-primary/5 transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-primary/40 shadow-md scale-[1.02]' : ''
        } ${isDragging ? 'opacity-50 shadow-2xl' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <div className="cursor-grab active:cursor-grabbing flex-shrink-0 pt-1">
              <GripVertical className="h-5 w-5 text-primary/60" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg text-foreground">{epic.title}</CardTitle>
                <Badge variant="secondary">
                  {epic.userStories.length} User Stor{epic.userStories.length !== 1 ? 'ies' : 'y'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(epic.id)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-foreground">User Stories</h4>
            <Button
              onClick={() => setIsAddStoryOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User Story
            </Button>
          </div>

          {epic.userStories.length === 0 ? (
            <div className="text-center py-6 bg-card rounded-lg border-2 border-dashed border-border">
              <p className="text-muted-foreground mb-3">No user stories in this epic yet</p>
              <Button
                onClick={() => setIsAddStoryOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First User Story
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {epic.userStories.map((story) => (
                <UserStoryCard
                  key={story.id}
                  userStory={story}
                  onUpdate={updateUserStory}
                  onDelete={deleteUserStory}
                  onReorder={handleUserStoryReorder}
                  onAddAcceptanceCriteria={onAddAcceptanceCriteria}
                  onUpdateAcceptanceCriteria={onUpdateAcceptanceCriteria}
                  onDeleteAcceptanceCriteria={onDeleteAcceptanceCriteria}
                  onAcceptanceCriteriaMove={onAcceptanceCriteriaMove}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <AddUserStoryDialog
        open={isAddStoryOpen}
        onOpenChange={setIsAddStoryOpen}
        onAdd={addUserStory}
      />

      <EditEpicDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        epic={epic}
        onUpdate={updateEpic}
      />
    </Card>
    
    {/* Drop indicator below */}
    {isDragOver && dragPosition === 'below' && (
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-lg z-10">
        <div className="absolute left-2 -top-1 w-2 h-2 bg-primary rounded-full"></div>
      </div>
    )}
  </div>
  );
};
