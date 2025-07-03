
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemes } from "@/hooks/useThemes";
import { Plus, BookOpen, MessageSquare, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { AddThemeDialog } from "@/components/AddThemeDialog";
import { useState } from "react";

const Dashboard = () => {
  const { themes = [], isLoading } = useThemes();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const recentThemes = themes.slice(0, 3);

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your themes, epics, and user stories</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : themes.length}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Theme
              </Button>
              <Button variant="outline" asChild>
                <Link to="/themes" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  View All Themes
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/chat" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {recentThemes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Themes</CardTitle>
              <CardDescription>Your most recently created themes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentThemes.map((theme) => (
                  <div key={theme.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">{theme.title}</h3>
                      {theme.description && (
                        <p className="text-sm text-gray-600">{theme.description}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/theme/${theme.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AddThemeDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          onAdd={() => setIsAddDialogOpen(false)}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
