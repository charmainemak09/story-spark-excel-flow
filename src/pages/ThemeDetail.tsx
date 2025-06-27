import { useParams, useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useThemes } from "@/hooks/useThemes";
import { useEpics } from "@/hooks/useEpics";
import { useUserStories } from "@/hooks/useUserStories";
import { useAcceptanceCriteria } from "@/hooks/useAcceptanceCriteria";
import { ThemeCard } from "@/components/ThemeCard";
import { ExportButton } from "@/components/ExportButton";
import { format } from "date-fns";

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const { themes, isLoading, updateTheme, deleteTheme } = useThemes();
  const { createEpic, updateEpic, deleteEpic } = useEpics();
  const { createUserStory, updateUserStory, deleteUserStory } = useUserStories();
  const { createAcceptanceCriteria, updateAcceptanceCriteria, deleteAcceptanceCriteria } = useAcceptanceCriteria();
  
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
      description: updatedTheme.description,
      dueDate: updatedTheme.dueDate
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

  const handleAddUserStory = (epicId: string, user: string, action: string, result: string) => {
    createUserStory({ epicId, user, action, result });
  };

  const handleUpdateUserStory = (storyId: string, user: string, action: string, result: string) => {
    updateUserStory({ id: storyId, user, action, result });
  };

  const handleDeleteUserStory = (storyId: string) => {
    if (confirm("Are you sure you want to delete this user story?")) {
      deleteUserStory(storyId);
    }
  };

  const handleAddAcceptanceCriteria = (userStoryId: string, given: string, when: string, then: string) => {
    createAcceptanceCriteria({ userStoryId, given, when, then });
  };

  const handleUpdateAcceptanceCriteria = (criteriaId: string, given: string, when: string, then: string) => {
    updateAcceptanceCriteria({ id: criteriaId, given, when, then });
  };

  const handleDeleteAcceptanceCriteria = (criteriaId: string) => {
    if (confirm("Are you sure you want to delete this acceptance criteria?")) {
      deleteAcceptanceCriteria(criteriaId);
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
              <p className="text-gray-600 mb-2">{theme.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {theme.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Created: {format(new Date(theme.createdAt), 'MMM d, yyyy')}
                  </div>
                )}
                {theme.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {format(new Date(theme.dueDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ExportButton themes={[theme]} />
        </div>

        <ThemeCard
          theme={theme}
          onUpdate={handleUpdateTheme}
          onDelete={handleDeleteTheme}
          onAddEpic={handleAddEpic}
          onUpdateEpic={handleUpdateEpic}
          onDeleteEpic={handleDeleteEpic}
          onAddUserStory={handleAddUserStory}
          onUpdateUserStory={handleUpdateUserStory}
          onDeleteUserStory={handleDeleteUserStory}
          onAddAcceptanceCriteria={handleAddAcceptanceCriteria}
          onUpdateAcceptanceCriteria={handleUpdateAcceptanceCriteria}
          onDeleteAcceptanceCriteria={handleDeleteAcceptanceCriteria}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ThemeDetail;
