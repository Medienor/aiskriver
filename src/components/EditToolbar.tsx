import React from 'react';
import { RefreshCw, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EditToolbarProps {
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isRefreshing: boolean;
}

const EditToolbar: React.FC<EditToolbarProps> = ({ onRefresh, onEdit, onDelete, isRefreshing }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-2 flex space-x-2">
      <Button onClick={onRefresh} size="sm" variant="outline" className="text-gray-800 dark:text-gray-200" disabled={isRefreshing}>
        {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      </Button>
      <Button onClick={onEdit} size="sm" variant="outline" className="text-gray-800 dark:text-gray-200">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button onClick={onDelete} size="sm" variant="outline" className="text-gray-800 dark:text-gray-200">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EditToolbar;