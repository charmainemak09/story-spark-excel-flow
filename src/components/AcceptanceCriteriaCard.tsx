
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
    e.dataTransfer.setData('text/plain', criteria.id);
    e.dataTransfer.setData('application/x-criteria-id', criteria.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== criteria.id) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag over state if we're really leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== criteria.id && onReorder) {
      onReorder(draggedId, criteria.id);
    }
  };

  return (
    <Card 
      className={`border border-gray-200 bg-white transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-400 shadow-md transform scale-105' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical className="h-3 w-3 text-gray-400 mt-1 cursor-grab active:cursor-grabbing flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-800 whitespace-pre-wrap">
                <span className="font-semibold text-blue-600">Given</span> {criteria.given}, 
                <span className="font-semibold text-orange-600"> When</span> {criteria.when}, 
                <span className="font-semibold text-green-600"> Then</span> {criteria.then}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteCriteria}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 h-6 w-6 p-0"
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
  );
};
