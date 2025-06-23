import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, FileText } from 'lucide-react';
import { ThemeCard } from '@/components/ThemeCard';
import { AddThemeDialog } from '@/components/AddThemeDialog';
import { ExportButton } from '@/components/ExportButton';
import { useToast } from '@/hooks/use-toast';

export interface AcceptanceCriteria {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface UserStory {
  id: string;
  user: string;
  action: string;
  result: string;
  acceptanceCriteria: AcceptanceCriteria[];
}

export interface Epic {
  id: string;
  title: string;
  userStories: UserStory[];
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  epics: Epic[];
}

const Index = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);
  const { toast } = useToast();

  const addTheme = (title: string, description: string) => {
    const newTheme: Theme = {
      id: Date.now().toString(),
      title,
      description,
      epics: []
    };
    setThemes([...themes, newTheme]);
    toast({
      title: "Theme added",
      description: `"${title}" has been added to your user story map.`,
    });
  };

  const updateTheme = (updatedTheme: Theme) => {
    setThemes(themes.map(theme => 
      theme.id === updatedTheme.id ? updatedTheme : theme
    ));
  };

  const deleteTheme = (themeId: string) => {
    const themeToDelete = themes.find(t => t.id === themeId);
    setThemes(themes.filter(theme => theme.id !== themeId));
    toast({
      title: "Theme deleted",
      description: `"${themeToDelete?.title}" has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Story Mapper</h1>
              <p className="text-gray-600">Create and organize your user stories by themes and epics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ExportButton themes={themes} />
            <Button onClick={() => setIsAddThemeOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Theme
            </Button>
          </div>
        </div>

        {/* Content */}
        {themes.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-600">No themes yet</CardTitle>
              <CardDescription className="text-lg">
                Start by creating your first theme to organize your user stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setIsAddThemeOpen(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Theme
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onUpdate={updateTheme}
                onDelete={deleteTheme}
              />
            ))}
          </div>
        )}

        <AddThemeDialog
          open={isAddThemeOpen}
          onOpenChange={setIsAddThemeOpen}
          onAdd={addTheme}
        />
      </div>
    </div>
  );
};

export default Index;
