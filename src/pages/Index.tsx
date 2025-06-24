
import { useState } from "react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeCard } from "@/components/ThemeCard";
import { AddThemeDialog } from "@/components/AddThemeDialog";
import { ExportButton } from "@/components/ExportButton";
import { Theme, Epic, UserStory, AcceptanceCriteria } from "@/types/userStory";

// Re-export types for backward compatibility
export type { Theme, Epic, UserStory, AcceptanceCriteria };

const Index = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);

  const addTheme = (title: string, description: string) => {
    const newTheme: Theme = {
      id: Date.now().toString(),
      title,
      description,
      epics: []
    };
    setThemes([...themes, newTheme]);
  };

  const updateTheme = (updatedTheme: Theme) => {
    setThemes(themes.map(theme => 
      theme.id === updatedTheme.id ? updatedTheme : theme
    ));
  };

  const deleteTheme = (themeId: string) => {
    setThemes(themes.filter(theme => theme.id !== themeId));
  };

  const handleThemeReorder = (draggedThemeId: string, targetThemeId: string) => {
    const themesCopy = [...themes];
    const draggedIndex = themesCopy.findIndex(t => t.id === draggedThemeId);
    const targetIndex = themesCopy.findIndex(t => t.id === targetThemeId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedTheme] = themesCopy.splice(draggedIndex, 1);
      themesCopy.splice(targetIndex, 0, draggedTheme);
      setThemes(themesCopy);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Story Mapper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize and visualize your user stories with ease
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setIsAddThemeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Theme
            </Button>
            <ExportButton themes={themes} />
          </div>
        </div>

        {themes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Start Building Your User Story Map
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first theme to begin organizing your user stories
            </p>
            <Button
              onClick={() => setIsAddThemeOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Theme
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
    </AuthenticatedLayout>
  );
};

export default Index;
