
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportData[]) => Promise<ImportResult>;
}

interface ImportData {
  epic: string;
  userStory: string;
  action: string;
  result: string;
  acceptanceCriteria?: string;
}

interface ImportResult {
  totalRows: number;
  newUserStories: number;
  duplicatesSkipped: number;
}

export const BulkImportDialog = ({ open, onOpenChange, onImport }: BulkImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        'Theme': 'User Management',
        'Epic': 'User Authentication',
        'User Story': 'As a customer, I want to log into my account, so that I can access my personal information',
        'Acceptance Criteria': 'Given I am on the login page, When I enter valid credentials, Then I should be redirected to my dashboard'
      },
      {
        'Theme': 'User Management',
        'Epic': 'User Authentication',
        'User Story': 'As a customer, I want to reset my password, so that I can regain access to my account',
        'Acceptance Criteria': 'Given I forgot my password, When I click reset password, Then I should receive a reset email'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Stories Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Theme
      { wch: 20 }, // Epic
      { wch: 50 }, // User Story
      { wch: 60 }  // Acceptance Criteria
    ];

    XLSX.writeFile(workbook, 'user-stories-template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseUserStory = (userStoryText: string) => {
    // Parse "As a [user], I want to [action], so that [result]" format
    const regex = /As\s+a\s+([^,]+),\s*I\s+want\s+to\s+([^,]+),\s*so\s+that\s+(.+)/i;
    const match = userStoryText.match(regex);
    
    if (match) {
      return {
        user: match[1].trim(),
        action: match[2].trim(),
        result: match[3].trim()
      };
    }
    
    // Fallback: treat the whole text as action if format doesn't match
    return {
      user: 'user',
      action: userStoryText.trim(),
      result: 'achieve the desired outcome'
    };
  };

  const processExcelFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importData: ImportData[] = jsonData.map((row: any) => {
        const userStoryText = row['User Story'] || '';
        const parsedUserStory = parseUserStory(userStoryText);
        
        return {
          epic: row['Epic'] || '',
          userStory: parsedUserStory.user,
          action: parsedUserStory.action,
          result: parsedUserStory.result,
          acceptanceCriteria: row['Acceptance Criteria'] || ''
        };
      }).filter(item => item.epic && item.userStory && item.action && item.result);

      if (importData.length === 0) {
        toast({
          title: "Error",
          description: "No valid data found in the Excel file. Please check the template format.",
          variant: "destructive",
        });
        return;
      }

      const result = await onImport(importData);
      setImportResult(result);

      toast({
        title: "Import Completed",
        description: `Processed ${result.totalRows} rows. ${result.newUserStories} new user stories added, ${result.duplicatesSkipped} duplicates skipped.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to process the Excel file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import User Stories</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple user stories at once. The template format matches your CSV export structure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h4>
            <p className="text-sm text-blue-700 mb-3">
              Download the Excel template with the same format as your CSV exports (Theme, Epic, User Story, Acceptance Criteria).
            </p>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h4 className="font-medium">Step 2: Upload Your Excel File</h4>
            <div className="space-y-2">
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>

          {/* Format Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Expected Format</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Theme:</strong> Theme title (will be ignored since you're importing to current theme)</p>
              <p><strong>Epic:</strong> Epic title</p>
              <p><strong>User Story:</strong> "As a [user], I want to [action], so that [result]"</p>
              <p><strong>Acceptance Criteria:</strong> "Given [condition], When [action], Then [result]"</p>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Import Summary</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>Total rows processed: <span className="font-medium">{importResult.totalRows}</span></p>
                <p>New user stories added: <span className="font-medium">{importResult.newUserStories}</span></p>
                <p>Duplicates skipped: <span className="font-medium">{importResult.duplicatesSkipped}</span></p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button
                onClick={processExcelFile}
                disabled={!file || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
