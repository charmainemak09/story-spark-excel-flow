
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, description: string, dueDate?: string) => void;
}

export const AddThemeDialog = ({ open, onOpenChange, onAdd }: AddThemeDialogProps) => {
  const [title, setTitle] = useState('');
  const [problemToSolve, setProblemToSolve] = useState('');
  const [projectObjective, setProjectObjective] = useState('');
  const [dueDate, setDueDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // Combine both fields into description with clear separation
      const description = `Problem: ${problemToSolve.trim()}\n\nObjective: ${projectObjective.trim()}`;
      const dueDateString = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined;
      onAdd(title.trim(), description, dueDateString);
      setTitle('');
      setProblemToSolve('');
      setProjectObjective('');
      setDueDate(undefined);
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
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
