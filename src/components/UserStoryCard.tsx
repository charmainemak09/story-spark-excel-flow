import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { UserStory } from '@/types/userStory';
import { AcceptanceCriteriaCard } from './AcceptanceCriteriaCard';
import { AddAcceptanceCriteriaDialog } from './AddAcceptanceCriteriaDialog';
import { EditUserStoryDialog } from './EditUserStoryDialog';
import { useAcceptanceCriteriaReorder } from '@/hooks/useAcceptanceCriteriaReorder';

interface UserStoryCardProps {
  userStory: UserStory;
  onUpdate: (userStory: UserStory) => void;
  onDelete: (storyId: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
  onAddAcceptanceCriteria?: (userStoryId: string, given: string, when: string, then: string) => void;
  onUpdateAcceptanceCriteria?: (criteriaId: string, given: string, when: string, then: string) => void;
  onDeleteAcceptanceCriteria?: (criteriaId: string) => void;
  onAcceptanceCriteriaMove?: (criteriaId: string, targetUserStoryId: string) => void;
}

export const UserStoryCard = ({ 
  userStory, 
  onUpdate, 
  onDelete, 
  onReorder,
  onAddAcceptanceCriteria,
  onUpdateAcceptanceCriteria,
  onDeleteAcceptanceCriteria,
  onAcceptanceCriteriaMove
}: UserStoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddCriteriaOpen, setIsAddCriteriaOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { reorderCriteria } = useAcceptanceCriteriaReorder();

  const addAcceptanceCriteria = (given: string, when: string, then: string) => {
    if (onAddAcceptanceCriteria) {
      onAddAcceptanceCriteria(userStory.id, given, when, then);
    } else {
      const newCriteria = {
        id: Date.now().toString(),
        given,
        when,
        then
      };
      onUpdate({
        ...userStory,
        acceptanceCriteria: [...userStory.acceptanceCriteria, newCriteria]
      });
    }
  };

  const updateAcceptanceCriteria = (updatedCriteria: any) => {
    if (onUpdateAcceptanceCriteria) {
      onUpdateAcceptanceCriteria(updatedCriteria.id, updatedCriteria.given, updatedCriteria.when, updatedCriteria.then);
    } else {
      onUpdate({
        ...userStory,
        acceptanceCriteria: userStory.acceptanceCriteria.map(criteria => 
          criteria.id === updatedCriteria.id ? updatedCriteria : criteria
        )
      });
    }
  };

  const deleteAcceptanceCriteria = (criteriaId: string) => {
    if (onDeleteAcceptanceCriteria) {
      onDeleteAcceptanceCriteria(criteriaId);
    } else {
      onUpdate({
        ...userStory,
        acceptanceCriteria: userStory.acceptanceCriteria.filter(criteria => criteria.id !== criteriaId)
      });
    }
  };

  const updateUserStory = (user: string, action: string, result: string) => {
    onUpdate({
      ...userStory,
      user,
      action,
      result
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('User story drag start:', userStory.id);
    e.dataTransfer.setData('text/plain', userStory.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'user-story', id: userStory.id }));
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
        if (parsedData.type === 'user-story' || parsedData.type === 'acceptance-criteria') {
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
      
      if (parsedData.type === 'user-story' && draggedId !== userStory.id && onReorder) {
        console.log('Reordering user story:', draggedId, 'to', userStory.id);
        onReorder(draggedId, userStory.id);
      } else if (parsedData.type === 'acceptance-criteria' && onAcceptanceCriteriaMove) {
        console.log('Moving acceptance criteria:', draggedId, 'to user story:', userStory.id);
        onAcceptanceCriteriaMove(draggedId, userStory.id);
      }
    } catch {
      // Fallback for plain text data
      if (draggedId && draggedId !== userStory.id && onReorder) {
        console.log('Fallback reordering user story:', draggedId, 'to', userStory.id);
        onReorder(draggedId, userStory.id);
      }
    }
  };

  const handleAcceptanceCriteriaReorder = (draggedCriteriaId: string, targetCriteriaId: string) => {
    console.log('Reordering acceptance criteria:', draggedCriteriaId, 'to', targetCriteriaId);
    const criteria = [...userStory.acceptanceCriteria];
    const draggedIndex = criteria.findIndex(c => c.id === draggedCriteriaId);
    const targetIndex = criteria.findIndex(c => c.id === targetCriteriaId);
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      const [draggedCriteria] = criteria.splice(draggedIndex, 1);
      criteria.splice(targetIndex, 0, draggedCriteria);
      
      // Update local state immediately
      onUpdate({
        ...userStory,
        acceptanceCriteria: criteria
      });

      // Update database order
      const criteriaIds = criteria.map(c => c.id);
      reorderCriteria({ userStoryId: userStory.id, criteriaIds });
    }
  };

  return (
    <div className="relative">
      {/* Drop indicator above */}
      {isDragOver && dragPosition === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-destructive rounded-full shadow-lg z-10">
          <div className="absolute left-2 -top-1 w-2 h-2 bg-destructive rounded-full"></div>
        </div>
      )}
      
      <Card 
        className={`border-destructive/30 bg-card transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-destructive/50 shadow-md scale-[1.02]' : ''
        } ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <div className="cursor-grab active:cursor-grabbing flex-shrink-0 pt-1">
              <GripVertical className="h-4 w-4 text-destructive/60" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  USER STORY
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {userStory.acceptanceCriteria.length} AC
                </Badge>
              </div>
              <p className="text-sm text-foreground font-medium whitespace-pre-wrap">
                As a <span className="font-semibold text-destructive">{userStory.user}</span>, 
                I want to <span className="font-semibold text-destructive">{userStory.action}</span>, 
                so that <span className="font-semibold text-destructive">{userStory.result}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(userStory.id)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-foreground">Acceptance Criteria</h5>
            <Button
              onClick={() => setIsAddCriteriaOpen(true)}
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add AC
            </Button>
          </div>

          {userStory.acceptanceCriteria.length === 0 ? (
            <div className="text-center py-4 bg-card rounded border-2 border-dashed border-border">
              <p className="text-muted-foreground text-xs mb-2">No acceptance criteria yet</p>
              <Button
                onClick={() => setIsAddCriteriaOpen(true)}
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Criteria
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {userStory.acceptanceCriteria.map((criteria) => (
                <AcceptanceCriteriaCard
                  key={criteria.id}
                  criteria={criteria}
                  onUpdate={updateAcceptanceCriteria}
                  onDelete={deleteAcceptanceCriteria}
                  onUpdateAcceptanceCriteria={onUpdateAcceptanceCriteria}
                  onDeleteAcceptanceCriteria={onDeleteAcceptanceCriteria}
                  onReorder={handleAcceptanceCriteriaReorder}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <AddAcceptanceCriteriaDialog
        open={isAddCriteriaOpen}
        onOpenChange={setIsAddCriteriaOpen}
        onAdd={addAcceptanceCriteria}
      />

      <EditUserStoryDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userStory={userStory}
        onUpdate={updateUserStory}
      />
    </Card>
    
    {/* Drop indicator below */}
    {isDragOver && dragPosition === 'below' && (
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-destructive rounded-full shadow-lg z-10">
        <div className="absolute left-2 -top-1 w-2 h-2 bg-destructive rounded-full"></div>
      </div>
    )}
  </div>
  );
};
