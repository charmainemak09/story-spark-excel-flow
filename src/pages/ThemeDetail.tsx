
import { useParams, useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useThemes } from "@/hooks/useThemes";
import { useEpics } from "@/hooks/useEpics";
import { ThemeCard } from "@/components/ThemeCard";

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { themes, isLoading, updateTheme, deleteTheme } = useThemes();
  const { createEpic, updateEpic, deleteEpic } = useEpics();
  
  const theme = themes.find(t => t.id === themeId);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading theme...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!theme) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Theme Not Found</h2>
            <Button onClick={() => navigate('/themes')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Themes
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const handleUpdateTheme = (updatedTheme: any) => {
    updateTheme({ 
      id: updatedTheme.id, 
      title: updatedTheme.title, 
      description: updatedTheme.description 
    });
  };

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      deleteTheme(themeId);
      navigate('/themes');
    }
  };

  const handleAddEpic = (title: string) => {
    if (themeId) {
      createEpic({ themeId, title });
    }
  };

  const handleUpdateEpic = (epicId: string, title: string) => {
    updateEpic({ id: epicId, title });
  };

  const handleDeleteEpic = (epicId: string) => {
    if (confirm("Are you sure you want to delete this epic?")) {
      deleteEpic(epicId);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/themes')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Themes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{theme.title}</h1>
              <p className="text-gray-600">{theme.description}</p>
            </div>
          </div>
        </div>

        <ThemeCard
          theme={theme}
          onUpdate={handleUpdateTheme}
          onDelete={handleDeleteTheme}
          onAddEpic={handleAddEpic}
          onUpdateEpic={handleUpdateEpic}
          onDeleteEpic={handleDeleteEpic}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ThemeDetail;
