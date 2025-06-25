
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Acceptance Criteria</DialogTitle>
          <DialogDescription>
            Define acceptance criteria using the format: Given {'{given}'}, When {'{when}'}, Then {'{then}'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="given">Given (setting/context)</Label>
            <Textarea
              id="given"
              placeholder="user is on the login page"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              required
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="when">When (action)</Label>
            <Textarea
              id="when"
              placeholder="they enter valid credentials"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="then">Then (result)</Label>
            <Textarea
              id="then"
              placeholder="they should be redirected to dashboard"
              value={then}
              onChange={(e) => setThen(e.target.value)}
              required
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Criteria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
