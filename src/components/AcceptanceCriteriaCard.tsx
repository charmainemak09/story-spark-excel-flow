
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { AcceptanceCriteria } from '@/types/userStory';
import { EditAcceptanceCriteriaDialog } from './EditAcceptanceCriteriaDialog';

interface AcceptanceCriteriaCardProps {
  criteria: AcceptanceCriteria;
  onUpdate: (criteria: AcceptanceCriteria) => void;
  onDelete: (criteriaId: string) => void;
}

export const AcceptanceCriteriaCard = ({ criteria, onUpdate, onDelete }: AcceptanceCriteriaCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const updateCriteria = (given: string, when: string, then: string) => {
    onUpdate({
      ...criteria,
      given,
      when,
      then
    });
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-800">
              <span className="font-semibold text-blue-600">Given</span> {criteria.given}, 
              <span className="font-semibold text-orange-600"> When</span> {criteria.when}, 
              <span className="font-semibold text-green-600"> Then</span> {criteria.then}
            </p>
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
              onClick={() => onDelete(criteria.id)}
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
