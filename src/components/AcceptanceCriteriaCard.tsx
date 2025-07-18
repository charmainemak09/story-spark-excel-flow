
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { AcceptanceCriteria } from '@/types/userStory';
import { EditAcceptanceCriteriaDialog } from './EditAcceptanceCriteriaDialog';

interface AcceptanceCriteriaCardProps {
  criteria: AcceptanceCriteria;
  onUpdate: (criteria: AcceptanceCriteria) => void;
  onDelete: (criteriaId: string) => void;
  onUpdateAcceptanceCriteria?: (criteriaId: string, given: string, when: string, then: string) => void;
  onDeleteAcceptanceCriteria?: (criteriaId: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
}

export const AcceptanceCriteriaCard = ({ 
  criteria, 
  onUpdate, 
  onDelete,
  onUpdateAcceptanceCriteria,
  onDeleteAcceptanceCriteria,
  onReorder
}: AcceptanceCriteriaCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateCriteria = (given: string, when: string, then: string) => {
    if (onUpdateAcceptanceCriteria) {
      onUpdateAcceptanceCriteria(criteria.id, given, when, then);
    } else {
      onUpdate({
        ...criteria,
        given,
        when,
        then
      });
    }
  };

  const deleteCriteria = () => {
    if (onDeleteAcceptanceCriteria) {
      onDeleteAcceptanceCriteria(criteria.id);
    } else {
      onDelete(criteria.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('Acceptance criteria drag start:', criteria.id);
    e.dataTransfer.setData('text/plain', criteria.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'acceptance-criteria', id: criteria.id }));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    e.stopPropagation();
    
    // Add visual feedback to drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dragData = e.dataTransfer.getData('application/json');
    
    try {
      const parsedData = JSON.parse(dragData);
      if (parsedData.type === 'acceptance-criteria') {
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
        
        // Determine drop position based on mouse position
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDragPosition(e.clientY < midpoint ? 'above' : 'below');
      }
    } catch {
      // Check if it's a plain text criteria ID
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId && draggedId !== criteria.id) {
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDragPosition(e.clientY < midpoint ? 'above' : 'below');
      }
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
    const dragData = e.dataTransfer.getData('application/json');
    
    console.log('Acceptance criteria drop:', { draggedId, targetId: criteria.id, dragData });
    
    if (draggedId && draggedId !== criteria.id && onReorder) {
      try {
        const parsedData = JSON.parse(dragData);
        if (parsedData.type === 'acceptance-criteria') {
          console.log('Reordering acceptance criteria:', draggedId, 'to', criteria.id);
          onReorder(draggedId, criteria.id);
        }
      } catch {
        // Fallback for plain text data
        console.log('Fallback reordering acceptance criteria:', draggedId, 'to', criteria.id);
        onReorder(draggedId, criteria.id);
      }
    }
  };

  return (
    <div className="relative">
      {/* Drop indicator above */}
      {isDragOver && dragPosition === 'above' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-secondary rounded-full shadow-lg z-10">
          <div className="absolute left-2 -top-1 w-2 h-2 bg-secondary rounded-full"></div>
        </div>
      )}
      
      <Card 
        className={`border-secondary/30 bg-card transition-all duration-200 ${
          isDragOver ? 'ring-2 ring-secondary/50 shadow-md scale-[1.01]' : ''
        } ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <div className="cursor-grab active:cursor-grabbing flex-shrink-0 pt-1">
              <GripVertical className="h-3 w-3 text-secondary/60" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-foreground whitespace-pre-wrap">
                <span className="font-semibold text-primary">Given</span> {criteria.given}, 
                <span className="font-semibold text-accent"> When</span> {criteria.when}, 
                <span className="font-semibold text-secondary"> Then</span> {criteria.then}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/20 h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteCriteria}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>

      <EditAcceptanceCriteriaDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        criteria={criteria}
        onUpdate={updateCriteria}
      />
    </Card>
    
    {/* Drop indicator below */}
    {isDragOver && dragPosition === 'below' && (
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full shadow-lg z-10">
        <div className="absolute left-2 -top-1 w-2 h-2 bg-secondary rounded-full"></div>
      </div>
    )}
  </div>
  );
};
