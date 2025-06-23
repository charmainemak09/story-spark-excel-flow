import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Epic } from '@/pages/Index';
import { UserStoryCard } from './UserStoryCard';
import { AddUserStoryDialog } from './AddUserStoryDialog';
import { EditEpicDialog } from './EditEpicDialog';

interface EpicCardProps {
  epic: Epic;
  onUpdate: (epic: Epic) => void;
  onDelete: (epicId: string) => void;
}

export const EpicCard = ({ epic, onUpdate, onDelete }: EpicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const addUserStory = (user: string, action: string, result: string) => {
    const newUserStory = {
      id: Date.now().toString(),
      user,
      action,
      result,
      acceptanceCriteria: []
    };
    onUpdate({
      ...epic,
      userStories: [...epic.userStories, newUserStory]
    });
  };

  const updateUserStory = (updatedUserStory: any) => {
    onUpdate({
      ...epic,
      userStories: epic.userStories.map(story => 
        story.id === updatedUserStory.id ? updatedUserStory : story
      )
    });
  };

  const deleteUserStory = (storyId: string) => {
    onUpdate({
      ...epic,
      userStories: epic.userStories.filter(story => story.id !== storyId)
    });
  };

  const updateEpic = (title: string) => {
    onUpdate({
      ...epic,
      title
    });
  };

  return (
    <Card className="border border-purple-200 bg-purple-50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-purple-900">{epic.title}</CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {epic.userStories.length} User Stor{epic.userStories.length !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(epic.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-purple-900">User Stories</h4>
            <Button
              onClick={() => setIsAddStoryOpen(true)}
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User Story
            </Button>
          </div>

          {epic.userStories.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-purple-200">
              <p className="text-purple-600 mb-3">No user stories in this epic yet</p>
              <Button
                onClick={() => setIsAddStoryOpen(true)}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-600 hover:bg-purple-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First User Story
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {epic.userStories.map((story) => (
                <UserStoryCard
                  key={story.id}
                  userStory={story}
                  onUpdate={updateUserStory}
                  onDelete={deleteUserStory}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <AddUserStoryDialog
        open={isAddStoryOpen}
        onOpenChange={setIsAddStoryOpen}
        onAdd={addUserStory}
      />

      <EditEpicDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        epic={epic}
        onUpdate={updateEpic}
      />
    </Card>
  );
};
