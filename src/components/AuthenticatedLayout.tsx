
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { LogOut, BookOpen, Target, Home } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/themes', label: 'Themes', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Story Mapper</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Button
                    key={path}
                    variant={location.pathname === path ? "default" : "ghost"}
                    onClick={() => navigate(path)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  );
};
