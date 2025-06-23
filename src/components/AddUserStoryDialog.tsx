
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddUserStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (user: string, action: string, result: string) => void;
}

export const AddUserStoryDialog = ({ open, onOpenChange, onAdd }: AddUserStoryDialogProps) => {
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.trim() && action.trim() && result.trim()) {
      onAdd(user.trim(), action.trim(), result.trim());
      setUser('');
      setAction('');
      setResult('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User Story</DialogTitle>
          <DialogDescription>
            Create a new user story following the "As a {user}, I want to {action}, so that {result}" format.
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
              Add User Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
