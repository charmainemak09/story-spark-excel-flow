
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Check, X, Trash2 } from 'lucide-react';

interface ImportData {
  epic: string;
  userStory: string;
  action: string;
  result: string;
  acceptanceCriteria?: string;
}

interface ImportPreviewTableProps {
  data: ImportData[];
  onDataChange: (updatedData: ImportData[]) => void;
}

export const ImportPreviewTable = ({ data, onDataChange }: ImportPreviewTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<ImportData | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...data[index] });
  };

  const handleSave = () => {
    if (editingIndex !== null && editData) {
      const updatedData = [...data];
      updatedData[editingIndex] = editData;
      onDataChange(updatedData);
      setEditingIndex(null);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const handleDelete = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onDataChange(updatedData);
  };

  const formatUserStory = (userStory: string, action: string, result: string) => {
    return `As a ${userStory}, I want to ${action}, so that ${result}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Epic</TableHead>
            <TableHead>User Story</TableHead>
            <TableHead>Acceptance Criteria</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                {editingIndex === index ? (
                  <Input
                    value={editData?.epic || ''}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, epic: e.target.value } : null)}
                    className="min-w-[150px]"
                  />
                ) : (
                  <div className="font-medium">{item.epic}</div>
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="As a..."
                      value={editData?.userStory || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, userStory: e.target.value } : null)}
                    />
                    <Input
                      placeholder="I want to..."
                      value={editData?.action || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, action: e.target.value } : null)}
                    />
                    <Input
                      placeholder="So that..."
                      value={editData?.result || ''}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, result: e.target.value } : null)}
                    />
                  </div>
                ) : (
                  <div className="max-w-md">
                    {formatUserStory(item.userStory, item.action, item.result)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Textarea
                    value={editData?.acceptanceCriteria || ''}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, acceptanceCriteria: e.target.value } : null)}
                    rows={2}
                    className="min-w-[200px]"
                  />
                ) : (
                  <div className="max-w-md text-sm text-gray-600">
                    {item.acceptanceCriteria || 'No acceptance criteria'}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(index)} className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(index)} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
