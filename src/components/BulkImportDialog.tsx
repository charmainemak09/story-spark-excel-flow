
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImportPreviewTable } from './ImportPreviewTable';
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

type ImportStep = 'upload' | 'preview' | 'complete';

export const BulkImportDialog = ({ open, onOpenChange, onImport }: BulkImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  const { toast } = useToast();

  const downloadTemplate = () => {
    // Create CSV template data that matches the export format
    const templateData = [
      ['Theme', 'Epic', 'User Story', 'Acceptance Criteria'],
      ['User Management', 'User Authentication', 'As a customer, I want to log into my account, so that I can access my personal information', 'Given I am on the login page, When I enter valid credentials, Then I should be redirected to my dashboard'],
      ['User Management', 'User Authentication', 'As a customer, I want to reset my password, so that I can regain access to my account', 'Given I forgot my password, When I click reset password, Then I should receive a reset email'],
      ['Shopping Cart', 'Product Management', 'As a shopper, I want to add items to my cart, so that I can purchase multiple products at once', 'Given I am viewing a product, When I click add to cart, Then the item should be added to my shopping cart']
    ];

    // Convert to CSV string
    const csvContent = templateData
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user-stories-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      setCurrentStep('upload');
      setPreviewData([]);
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

  const parseCSVFile = async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          console.log('Raw CSV content:', csv);
          
          const lines = csv.split('\n').filter(line => line.trim());
          console.log('CSV lines after filtering:', lines.length);
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least a header row and one data row'));
            return;
          }

          // Parse header
          const headerLine = lines[0];
          const header = parseCSVLine(headerLine);
          console.log('Parsed header:', header);
          
          // Parse data rows
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              const values = parseCSVLine(line);
              console.log(`Parsing line ${i}:`, line);
              console.log(`Parsed values:`, values);
              
              // Create object from header and values
              const obj: any = {};
              header.forEach((h, index) => {
                obj[h] = values[index] || '';
              });
              data.push(obj);
            }
          }

          console.log('Final parsed data:', data);
          resolve(data);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  const parseCSVLine = (line: string): string[] => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value
    
    return values;
  };

  const processFileForPreview = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      let jsonData: any[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        jsonData = await parseCSVFile(file);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      console.log('Raw imported data:', jsonData);

      const importData: ImportData[] = jsonData.map((row: any, index: number) => {
        console.log(`Processing row ${index}:`, row);
        
        const userStoryText = row['User Story'] || '';
        const parsedUserStory = parseUserStory(userStoryText);
        
        const result = {
          epic: (row['Epic'] || '').toString().trim(),
          userStory: parsedUserStory.user,
          action: parsedUserStory.action,
          result: parsedUserStory.result,
          acceptanceCriteria: (row['Acceptance Criteria'] || '').toString().trim()
        };
        
        console.log(`Processed row ${index}:`, result);
        return result;
      }).filter(item => {
        const isValid = item.epic && item.userStory && item.action && item.result;
        console.log('Item validation:', { item, isValid });
        return isValid;
      });

      console.log('Final import data:', importData);

      if (importData.length === 0) {
        toast({
          title: "Error",
          description: "No valid data found in the file. Please check the template format.",
          variant: "destructive",
        });
        return;
      }

      setPreviewData(importData);
      setCurrentStep('preview');

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to process the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    try {
      console.log('Starting import with data:', previewData);
      const result = await onImport(previewData);
      setImportResult(result);
      setCurrentStep('complete');

      toast({
        title: "Import Completed",
        description: `Processed ${result.totalRows} rows. ${result.newUserStories} new user stories added, ${result.duplicatesSkipped} duplicates skipped.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setCurrentStep('upload');
    setPreviewData([]);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('upload');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'upload' && 'Bulk Import User Stories'}
            {currentStep === 'preview' && 'Review Import Data'}
            {currentStep === 'complete' && 'Import Complete'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'upload' && 'Upload a CSV or Excel file to import multiple user stories at once.'}
            {currentStep === 'preview' && 'Review and edit the imported data before adding it to your workspace.'}
            {currentStep === 'complete' && 'Your user stories have been successfully imported.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 'upload' && (
            <>
              {/* Template Download */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download the CSV template with the same format as your CSV exports (Theme, Epic, User Story, Acceptance Criteria).
                </p>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <h4 className="font-medium">Step 2: Upload Your File</h4>
                <div className="space-y-2">
                  <Label htmlFor="import-file">Select CSV or Excel File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
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
            </>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {previewData.length} user stories ready for import. You can edit or remove items before importing.
                </p>
              </div>
              <ImportPreviewTable 
                data={previewData} 
                onDataChange={setPreviewData}
              />
            </div>
          )}

          {currentStep === 'complete' && importResult && (
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
          <div className="flex justify-between">
            <div>
              {currentStep === 'preview' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                {currentStep === 'complete' ? 'Close' : 'Cancel'}
              </Button>
              {currentStep === 'upload' && (
                <Button
                  onClick={processFileForPreview}
                  disabled={!file || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Preview Data
                    </>
                  )}
                </Button>
              )}
              {currentStep === 'preview' && (
                <Button
                  onClick={confirmImport}
                  disabled={previewData.length === 0 || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {previewData.length} User Stories
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
