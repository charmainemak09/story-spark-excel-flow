
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemes } from "@/hooks/useThemes";

const Dashboard = () => {
  const navigate = useNavigate();
  const { themes, isLoading } = useThemes();

  const totalEpics = themes.reduce((total, theme) => total + theme.epics.length, 0);
  const totalUserStories = themes.reduce((total, theme) => 
    total + theme.epics.reduce((epicTotal, epic) => epicTotal + epic.userStories.length, 0), 0
  );

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Story Mapper Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize and visualize your user stories with ease
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '-' : themes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Epics</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '-' : totalEpics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total User Stories</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '-' : totalUserStories}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/themes')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View All Themes
              </Button>
              <Button
                onClick={() => navigate('/themes')}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Theme
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest themes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : themes.length === 0 ? (
                <p className="text-gray-500">No themes yet. Create your first one!</p>
              ) : (
                <div className="space-y-2">
                  {themes.slice(0, 3).map(theme => (
                    <div
                      key={theme.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/theme/${theme.id}`)}
                    >
                      <div>
                        <p className="font-medium">{theme.title}</p>
                        <p className="text-sm text-gray-500">
                          {theme.epics.length} epics
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
