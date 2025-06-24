
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Theme } from '@/types/userStory';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  themes: Theme[];
}

export const ExportButton = ({ themes }: ExportButtonProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (themes.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some themes and user stories first.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvRows = [
      ['Theme', 'Epic', 'User Story', 'Acceptance Criteria']
    ];

    themes.forEach(theme => {
      theme.epics.forEach(epic => {
        epic.userStories.forEach(story => {
          const userStoryText = `As a ${story.user}, I want to ${story.action}, so that ${story.result}`;
          
          if (story.acceptanceCriteria.length === 0) {
            csvRows.push([theme.title, epic.title, userStoryText, '']);
          } else {
            story.acceptanceCriteria.forEach(criteria => {
              const criteriaText = `Given ${criteria.given}, When ${criteria.when}, Then ${criteria.then}`;
              csvRows.push([theme.title, epic.title, userStoryText, criteriaText]);
            });
          }
        });
        
        // If epic has no user stories, still show the epic
        if (epic.userStories.length === 0) {
          csvRows.push([theme.title, epic.title, '', '']);
        }
      });
      
      // If theme has no epics, still show the theme
      if (theme.epics.length === 0) {
        csvRows.push([theme.title, '', '', '']);
      }
    });

    // Convert to CSV string
    const csvContent = csvRows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user-story-map.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Your user story map has been exported as CSV.",
    });
  };

  return (
    <Button
      onClick={exportToCSV}
      variant="outline"
      className="border-green-300 text-green-600 hover:bg-green-50"
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
};
