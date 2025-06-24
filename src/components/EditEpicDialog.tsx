import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Epic } from '@/types/userStory';

interface EditEpicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epic: Epic;
  onUpdate: (title: string) => void;
}

export const EditEpicDialog = ({ open, onOpenChange, epic, onUpdate }: EditEpicDialogProps) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(epic.title);
    }
  }, [open, epic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdate(title.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Epic</DialogTitle>
          <DialogDescription>
            Update the epic title.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter epic title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Update Epic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
