import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Theme } from '@/pages/Index';
import { EpicCard } from './EpicCard';
import { AddEpicDialog } from './AddEpicDialog';
import { EditThemeDialog } from './EditThemeDialog';

interface ThemeCardProps {
  theme: Theme;
  onUpdate: (theme: Theme) => void;
  onDelete: (themeId: string) => void;
}

export const ThemeCard = ({ theme, onUpdate, onDelete }: ThemeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddEpicOpen, setIsAddEpicOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const addEpic = (title: string) => {
    const newEpic = {
      id: Date.now().toString(),
      title,
      userStories: []
    };
    onUpdate({
      ...theme,
      epics: [...theme.epics, newEpic]
    });
  };

  const updateEpic = (updatedEpic: any) => {
    onUpdate({
      ...theme,
      epics: theme.epics.map(epic => 
        epic.id === updatedEpic.id ? updatedEpic : epic
      )
    });
  };

  const deleteEpic = (epicId: string) => {
    onUpdate({
      ...theme,
      epics: theme.epics.filter(epic => epic.id !== epicId)
    });
  };

  const updateTheme = (title: string, description: string) => {
    onUpdate({
      ...theme,
      title,
      description
    });
  };

  const totalUserStories = theme.epics.reduce((total, epic) => total + epic.userStories.length, 0);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl text-blue-900">{theme.title}</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {theme.epics.length} Epic{theme.epics.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {totalUserStories} User Stor{totalUserStories !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>
            <CardDescription className="text-blue-700">{theme.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(theme.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Epics</h3>
            <Button
              onClick={() => setIsAddEpicOpen(true)}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Epic
            </Button>
          </div>

          {theme.epics.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No epics in this theme yet</p>
              <Button
                onClick={() => setIsAddEpicOpen(true)}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Epic
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {theme.epics.map((epic) => (
                <EpicCard
                  key={epic.id}
                  epic={epic}
                  onUpdate={updateEpic}
                  onDelete={deleteEpic}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}

      <AddEpicDialog
        open={isAddEpicOpen}
        onOpenChange={setIsAddEpicOpen}
        onAdd={addEpic}
      />

      <EditThemeDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        theme={theme}
        onUpdate={updateTheme}
      />
    </Card>
  );
};
