import React from 'react';
import { AlignLeft, Heading2, Heading3, List, ListOrdered, BarChart, Table, Loader2 } from 'lucide-react';

interface DropdownMenuProps {
  onItemClick: (item: string, subItem?: string) => void;
  position: { x: number; y: number };
  loadingItem: string | null;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onItemClick, position, loadingItem }) => {
  const menuItems = [
    { name: 'Tekst', icon: AlignLeft },
    { name: 'Tittel 2', icon: Heading2 },
    { name: 'Tittel 3', icon: Heading3 },
    { name: 'Punktliste', icon: List },
    { name: 'Nummerert liste', icon: ListOrdered },
    { name: 'Graf', icon: BarChart, disabled: true },
    { name: 'Tabell', icon: Table, disabled: true }
  ];

  return (
    <div 
      className="editor-dropdown bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        marginTop: '5px',
        zIndex: 1000,
      }}
    >
      {menuItems.map((item) => (
        <div
          key={item.name}
          onClick={() => !item.disabled && onItemClick(item.name)}
          className={`p-2 cursor-${item.disabled ? 'not-allowed' : 'pointer'} flex items-center ${item.disabled ? 'opacity-50' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          {loadingItem === item.name ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600 dark:text-blue-400 stroke-2" />
          ) : (
            <item.icon className={`w-5 h-5 mr-2 ${item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-blue-600 dark:text-blue-400'} stroke-2`} />
          )}
          <span className={`text-xs font-semibold ${item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default DropdownMenu;
