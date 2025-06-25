
import { useState } from "react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit2, Trash2, Calendar } from "lucide-react";
import { useThemes } from "@/hooks/useThemes";
import { AddThemeDialog } from "@/components/AddThemeDialog";
import { EditThemeDialog } from "@/components/EditThemeDialog";
import { useNavigate } from "react-router-dom";
import { Theme } from "@/types/userStory";

const ThemesList = () => {
  const navigate = useNavigate();
  const { themes, isLoading, createTheme, updateTheme, deleteTheme } = useThemes();
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  const addTheme = (title: string, description: string) => {
    createTheme({ title, description });
  };

  const handleUpdateTheme = (title: string, description: string) => {
    if (editingTheme) {
      updateTheme({ id: editingTheme.id, title, description });
      setEditingTheme(null);
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this theme? This will also delete all associated epics and user stories.")) {
      deleteTheme(themeId);
    }
  };

  const handleViewTheme = (themeId: string) => {
    navigate(`/theme/${themeId}`);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading themes...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Themes</h1>
            <p className="text-gray-600">Organize and manage your user story themes</p>
          </div>
          <Button
            onClick={() => setIsAddThemeOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Theme
          </Button>
        </div>

        {themes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No Themes Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first theme to start organizing your user stories
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => {
              const totalEpics = theme.epics.length;
              const totalUserStories = theme.epics.reduce((total, epic) => total + epic.userStories.length, 0);
              
              return (
                <Card key={theme.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">{theme.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {totalEpics} Epic{totalEpics !== 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {totalUserStories} User Stor{totalUserStories !== 1 ? 'ies' : 'y'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {theme.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTheme(theme.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTheme(theme)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AddThemeDialog
          open={isAddThemeOpen}
          onOpenChange={setIsAddThemeOpen}
          onAdd={addTheme}
        />

        {editingTheme && (
          <EditThemeDialog
            open={!!editingTheme}
            onOpenChange={() => setEditingTheme(null)}
            theme={editingTheme}
            onUpdate={handleUpdateTheme}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default ThemesList;
