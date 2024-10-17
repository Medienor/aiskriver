import React, { useCallback, memo, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, Heading2, Heading3, List, ListOrdered, Trash2, Table, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContentBlockProps {
  content: string;
  type: string;
  onAddElement: (type: string) => void;
  onContentChange: (newContent: string) => void;
  onDeleteBlock: () => void;
  onAddTable?: () => void;
  isLoadingTable?: boolean;
}

const ContentBlock: React.FC<ContentBlockProps> = memo(({ 
  content, 
  type, 
  onAddElement, 
  onContentChange, 
  onDeleteBlock, 
  onAddTable,
  isLoadingTable 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const elements = [
    { type: 'p', label: 'Paragraph', icon: Type },
    { type: 'h1', label: 'Heading 1', icon: Heading1 },
    { type: 'h2', label: 'Heading 2', icon: Heading2 },
    { type: 'h3', label: 'Heading 3', icon: Heading3 },
    { type: 'ul', label: 'Bullet List', icon: List },
    { type: 'ol', label: 'Numbered List', icon: ListOrdered },
    { type: 'table', label: 'Table', icon: Table },
  ];

  const handleAddElement = useCallback((type: string) => {
    if (type === 'table' && onAddTable) {
      onAddTable();
    } else {
      onAddElement(type);
    }
  }, [onAddElement, onAddTable]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      onContentChange(contentRef.current.innerHTML);
    }
  }, [onContentChange]);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) window.open(href, '_blank');
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.style.cursor = 'pointer';
        link.classList.add('link-with-tooltip');
      });
    }
  }, [content]);

  return (
    <div className="relative group content-block">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-8 opacity-0 group-hover:opacity-100 transition-opacity content-block-icons">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0 bg-white hover:bg-gray-100">
              <Plus size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {elements.map((element) => (
              <DropdownMenuItem key={element.type} onSelect={() => handleAddElement(element.type)}>
                <element.icon className="mr-2 h-4 w-4" />
                {element.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TooltipProvider>
        <div
          ref={contentRef}
          contentEditable={!isLoadingTable && type !== 'table'}
          suppressContentEditableWarning
          className="prose dark:prose-invert max-w-none content-block-inner"
          onInput={handleInput}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </TooltipProvider>
      {isLoadingTable && (
        <div className="flex flex-col items-center justify-center mt-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="mt-2 text-blue-500">Tenker..</span>
        </div>
      )}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0 bg-white hover:bg-red-100" onClick={onDeleteBlock}>
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    </div>
  );
});

ContentBlock.displayName = 'ContentBlock';

export default ContentBlock;