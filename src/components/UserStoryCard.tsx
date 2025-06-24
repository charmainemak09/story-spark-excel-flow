
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { UserStory } from '@/types/userStory';
import { AcceptanceCriteriaCard } from './AcceptanceCriteriaCard';
import { AddAcceptanceCriteriaDialog } from './AddAcceptanceCriteriaDialog';
import { EditUserStoryDialog } from './EditUserStoryDialog';

interface UserStoryCardProps {
  userStory: UserStory;
  onUpdate: (userStory: UserStory) => void;
  onDelete: (storyId: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
}

export const UserStoryCard = ({ userStory, onUpdate, onDelete, onReorder }: UserStoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddCriteriaOpen, setIsAddCriteriaOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const addAcceptanceCriteria = (given: string, when: string, then: string) => {
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
  };

  const updateAcceptanceCriteria = (updatedCriteria: any) => {
    onUpdate({
      ...userStory,
      acceptanceCriteria: userStory.acceptanceCriteria.map(criteria => 
        criteria.id === updatedCriteria.id ? updatedCriteria : criteria
      )
    });
  };

  const deleteAcceptanceCriteria = (criteriaId: string) => {
    onUpdate({
      ...userStory,
      acceptanceCriteria: userStory.acceptanceCriteria.filter(criteria => criteria.id !== criteriaId)
    });
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
    e.dataTransfer.setData('text/plain', userStory.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== userStory.id && onReorder) {
      onReorder(draggedId, userStory.id);
    }
  };

  return (
    <Card 
      className={`border border-green-200 bg-green-50 ${isDragOver ? 'ring-2 ring-green-400' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-green-400 mt-1 cursor-grab active:cursor-grabbing" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  USER STORY
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                  {userStory.acceptanceCriteria.length} AC
                </Badge>
              </div>
              <p className="text-sm text-green-900 font-medium">
                As a <span className="font-semibold text-green-800">{userStory.user}</span>, 
                I want to <span className="font-semibold text-green-800">{userStory.action}</span>, 
                so that <span className="font-semibold text-green-800">{userStory.result}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-green-600 hover:text-green-700 hover:bg-green-100 h-7 w-7 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(userStory.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 w-7 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-green-600 hover:text-green-700 hover:bg-green-100 h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-green-900">Acceptance Criteria</h5>
            <Button
              onClick={() => setIsAddCriteriaOpen(true)}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-100 h-7 text-xs px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add AC
            </Button>
          </div>

          {userStory.acceptanceCriteria.length === 0 ? (
            <div className="text-center py-4 bg-white rounded border-2 border-dashed border-green-200">
              <p className="text-green-600 text-xs mb-2">No acceptance criteria yet</p>
              <Button
                onClick={() => setIsAddCriteriaOpen(true)}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-600 hover:bg-green-100 h-7 text-xs px-2"
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
  );
};
