
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddAcceptanceCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (given: string, when: string, then: string) => void;
}

export const AddAcceptanceCriteriaDialog = ({ open, onOpenChange, onAdd }: AddAcceptanceCriteriaDialogProps) => {
  const [given, setGiven] = useState('');
  const [when, setWhen] = useState('');
  const [then, setThen] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (given.trim() && when.trim() && then.trim()) {
      onAdd(given.trim(), when.trim(), then.trim());
      setGiven('');
      setWhen('');
      setThen('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Acceptance Criteria</DialogTitle>
          <DialogDescription>
            Create new acceptance criteria following the "Given {setting}, When {action}, Then {result}" format.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="given">Given...</Label>
            <Input
              id="given"
              placeholder="e.g., user is on the login page"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="when">When...</Label>
            <Input
              id="when"
              placeholder="e.g., they enter valid credentials"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="then">Then...</Label>
            <Input
              id="then"
              placeholder="e.g., they are redirected to the dashboard"
              value={then}
              onChange={(e) => setThen(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Criteria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
