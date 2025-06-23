
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AcceptanceCriteria } from '@/pages/Index';

interface EditAcceptanceCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: AcceptanceCriteria;
  onUpdate: (given: string, when: string, then: string) => void;
}

export const EditAcceptanceCriteriaDialog = ({ open, onOpenChange, criteria, onUpdate }: EditAcceptanceCriteriaDialogProps) => {
  const [given, setGiven] = useState('');
  const [when, setWhen] = useState('');
  const [then, setThen] = useState('');

  useEffect(() => {
    if (open) {
      setGiven(criteria.given);
      setWhen(criteria.when);
      setThen(criteria.then);
    }
  }, [open, criteria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (given.trim() && when.trim() && then.trim()) {
      onUpdate(given.trim(), when.trim(), then.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Acceptance Criteria</DialogTitle>
          <DialogDescription>
            Update acceptance criteria using the format: Given {given}, When {when}, Then {then}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="given">Given (setting/context)</Label>
            <Input
              id="given"
              placeholder="user is on the login page"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="when">When (action)</Label>
            <Input
              id="when"
              placeholder="they enter valid credentials"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="then">Then (result)</Label>
            <Input
              id="then"
              placeholder="they should be redirected to dashboard"
              value={then}
              onChange={(e) => setThen(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Update Criteria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
