
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, description: string) => void;
}

export const AddThemeDialog = ({ open, onOpenChange, onAdd }: AddThemeDialogProps) => {
  const [title, setTitle] = useState('');
  const [problemToSolve, setProblemToSolve] = useState('');
  const [projectObjective, setProjectObjective] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Combine both fields into description with clear separation
      const description = `Problem: ${problemToSolve.trim()}\n\nObjective: ${projectObjective.trim()}`;
      onAdd(title.trim(), description);
      setTitle('');
      setProblemToSolve('');
      setProjectObjective('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Theme</DialogTitle>
          <DialogDescription>
            Create a new theme to organize your epics and user stories.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter theme title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problemToSolve">Problem Trying to Solve</Label>
            <Textarea
              id="problemToSolve"
              placeholder="Describe the problem this theme addresses..."
              value={problemToSolve}
              onChange={(e) => setProblemToSolve(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectObjective">Project Objective</Label>
            <Textarea
              id="projectObjective"
              placeholder="Describe the objective or goal of this theme..."
              value={projectObjective}
              onChange={(e) => setProjectObjective(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Theme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
