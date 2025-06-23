
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserStory } from '@/pages/Index';

interface EditUserStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userStory: UserStory;
  onUpdate: (user: string, action: string, result: string) => void;
}

export const EditUserStoryDialog = ({ open, onOpenChange, userStory, onUpdate }: EditUserStoryDialogProps) => {
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    if (open) {
      setUser(userStory.user);
      setAction(userStory.action);
      setResult(userStory.result);
    }
  }, [open, userStory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() && action.trim() && result.trim()) {
      onUpdate(user.trim(), action.trim(), result.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Story</DialogTitle>
          <DialogDescription>
            Update the user story following the "As a {user}, I want to {action}, so that {result}" format.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">As a...</Label>
            <Input
              id="user"
              placeholder="e.g., customer, admin, user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">I want to...</Label>
            <Input
              id="action"
              placeholder="e.g., view my order history"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="result">So that...</Label>
            <Input
              id="result"
              placeholder="e.g., I can track my purchases"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Update User Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
