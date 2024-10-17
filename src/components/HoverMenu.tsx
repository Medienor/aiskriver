import React from 'react';
import { Plus, Type, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HoverMenuProps {
  onAddElement: (type: string) => void;
}

const HoverMenu: React.FC<HoverMenuProps> = ({ onAddElement }) => {
  const elements = [
    { type: 'p', label: 'Text', icon: Type },
    { type: 'h1', label: 'Heading 1', icon: Heading1 },
    { type: 'h2', label: 'Heading 2', icon: Heading2 },
    { type: 'h3', label: 'Heading 3', icon: Heading3 },
    { type: 'ul', label: 'Bullet List', icon: List },
    { type: 'ol', label: 'Numbered List', icon: ListOrdered },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
          <Plus size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {elements.map((element) => (
          <DropdownMenuItem key={element.type} onSelect={() => onAddElement(element.type)}>
            <element.icon className="mr-2 h-4 w-4" />
            {element.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HoverMenu;