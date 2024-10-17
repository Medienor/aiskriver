import React, { useState, useEffect, useRef } from 'react';

interface FormatDropdownProps {
  onSelect: (format: string) => void;
  position: { top: number; left: number };
  visible: boolean; // Add this prop
}

const FormatDropdown: React.FC<FormatDropdownProps> = ({ onSelect, position, visible }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: 'Paragraph', value: 'p' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
    { label: 'Bullet List', value: 'bullet' },
    { label: 'Numbered List', value: 'ordered' },
    { label: 'Table', value: 'table' },
  ];

  useEffect(() => {
    console.log('FormatDropdown mounted');
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('Click outside dropdown, hiding');
        // You may want to call a function to hide the dropdown here
        // For example: onHide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log('FormatDropdown unmounted');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  console.log('FormatDropdown render, position:', position, 'visible:', visible);

  return (
    <div
      ref={dropdownRef}
      className={`absolute bg-white border border-gray-300 rounded shadow-lg ${visible ? 'block' : 'hidden'}`}
      style={{ 
        top: position.top, 
        left: position.left, 
        zIndex: 9999 // Highest z-index
      }}
    >
      <ul className="py-1">
        {options.map((option) => (
          <li
            key={option.value}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              console.log('Option selected:', option.value);
              onSelect(option.value);
              // You may want to call a function to hide the dropdown here
              // For example: onHide();
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormatDropdown;
