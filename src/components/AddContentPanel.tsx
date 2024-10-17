import React from 'react';
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, FileText, BarChart } from 'lucide-react';

interface AddContentPanelProps {
  position: { top: number; left: number };
  onAdd: (type: string) => void;
  onClose: () => void;
}

const AddContentPanel: React.FC<AddContentPanelProps> = ({ position, onAdd, onClose }) => {
  const options = [
    { type: 'p', icon: Type, label: 'Text' },
    { type: 'h1', icon: Heading1, label: 'H1' },
    { type: 'h2', icon: Heading2, label: 'H2' },
    { type: 'h3', icon: Heading3, label: 'H3' },
    { type: 'ul', icon: List, label: 'Bullet List' },
    { type: 'ol', icon: ListOrdered, label: 'Numbered List' },
    { type: 'form', icon: FileText, label: 'Form' },
    { type: 'chart', icon: BarChart, label: 'Chart' },
  ];

  return (
    <div
      className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onAdd(option.type)}
            className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <option.icon size={24} />
            <span className="text-xs mt-1">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddContentPanel;