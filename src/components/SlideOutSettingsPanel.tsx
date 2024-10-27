import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface SlideOutSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageChange: (language: string) => void;
  onVipPromptChange: (prompt: string) => void;
  initialLanguage: string;
  initialVipPrompt: string;
  initialCitationStyle: string;
  onCitationStyleChange: (style: string) => void;
  initialAutocomplete: boolean;
  initialAutocompleteButton: boolean;
  initialExternalCiting: boolean;
  initialLocalCiting: boolean;
  onAutocompleteChange: (value: boolean) => void;
  onAutocompleteButtonChange: (value: boolean) => void;
  onExternalCitingChange: (value: boolean) => void;
  onLocalCitingChange: (value: boolean) => void;
}

const languages = [
  { value: 'norwegian', label: 'Norsk' },
  { value: 'english', label: 'Engelsk' },
  { value: 'spanish', label: 'Spansk' },
  { value: 'french', label: 'Fransk' },
  { value: 'german', label: 'Tysk' },
  { value: 'chinese', label: 'Kinesisk' },
  { value: 'arabic', label: 'Arabisk' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'portuguese', label: 'Portugisisk' },
  { value: 'japanese', label: 'Japansk' },
  { value: 'russian', label: 'Russisk' },
];

const citationStyles = [
  { value: 'apa7', label: 'APA 7' },
  { value: 'mla9', label: 'MLA 9' },
  { value: 'ieee', label: 'IEEE' },
];

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find(option => option.value === selectedValue)?.label || 'Velg'}
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => {
                setSelectedValue(option.value);
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SlideOutSettingsPanel: React.FC<SlideOutSettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onLanguageChange, 
  onVipPromptChange, 
  initialLanguage,
  initialVipPrompt,
  initialCitationStyle,
  onCitationStyleChange,
  initialAutocomplete,
  initialAutocompleteButton,
  initialExternalCiting,
  initialLocalCiting,
  onAutocompleteChange,
  onAutocompleteButtonChange,
  onExternalCitingChange,
  onLocalCitingChange,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState(initialLanguage || 'norwegian');
  const [vipPrompt, setVipPrompt] = useState(initialVipPrompt || '');
  const [citationStyle, setCitationStyle] = useState(initialCitationStyle || 'apa7');
  const [autocomplete, setAutocomplete] = useState(initialAutocomplete);
  const [autocompleteButton, setAutocompleteButton] = useState(initialAutocompleteButton);
  const [externalCiting, setExternalCiting] = useState(initialExternalCiting);
  const [localCiting, setLocalCiting] = useState(initialLocalCiting);

  useEffect(() => {
    console.log('SlideOutSettingsPanel: Initial values:', {
      language: initialLanguage,
      vipPrompt: initialVipPrompt,
      citationStyle: initialCitationStyle,
      autocomplete: initialAutocomplete,
      autocompleteButton: initialAutocompleteButton,
      externalCiting: initialExternalCiting,
      localCiting: initialLocalCiting
    });
    setLanguage(initialLanguage || 'norwegian');
    setVipPrompt(initialVipPrompt || '');
    setCitationStyle(initialCitationStyle || 'apa7');
    setAutocomplete(initialAutocomplete);
    setAutocompleteButton(initialAutocompleteButton);
    setExternalCiting(initialExternalCiting);
    setLocalCiting(initialLocalCiting);
  }, [initialLanguage, initialVipPrompt, initialCitationStyle, initialAutocomplete, initialAutocompleteButton, initialExternalCiting, initialLocalCiting]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLanguageChange = (newLanguage: string) => {
    console.log('Language changed in settings panel:', newLanguage);
    setLanguage(newLanguage);
    onLanguageChange(newLanguage);
  };

  const handleVipPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = event.target.value;
    setVipPrompt(newPrompt);
    onVipPromptChange(newPrompt);
  };

  const handleCitationStyleChange = (newStyle: string) => {
    console.log('Citation style changed in settings panel:', newStyle);
    setCitationStyle(newStyle);
    onCitationStyleChange(newStyle);
  };

  const handleAutocompleteChange = (value: boolean) => {
    console.log('SlideOutSettingsPanel: Autocomplete changed to:', value);
    setAutocomplete(value);
    onAutocompleteChange(value);
  };

  const handleAutocompleteButtonChange = (value: boolean) => {
    console.log('SlideOutSettingsPanel: Autocomplete button changed to:', value);
    setAutocompleteButton(value);
    onAutocompleteButtonChange(value);
  };

  const handleExternalCitingChange = (value: boolean) => {
    console.log('SlideOutSettingsPanel: External citing changed to:', value);
    setExternalCiting(value);
    onExternalCitingChange(value);
  };

  const handleLocalCitingChange = (value: boolean) => {
    console.log('SlideOutSettingsPanel: Local citing changed to:', value);
    setLocalCiting(value);
    onLocalCitingChange(value);
  };

  return (
    <motion.div
      ref={panelRef}
      className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto"
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Innstillinger</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Språk</Label>
            <CustomDropdown 
              value={language} 
              onChange={handleLanguageChange} 
              options={languages} 
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Autofullfør</Label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Autofullfør</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Slå på for å aktivere autofullfør</p>
              </div>
              <Switch 
                checked={autocomplete}
                onCheckedChange={(value) => {
                  console.log('Switch component: Autocomplete toggled to:', value);
                  handleAutocompleteChange(value);
                }}
                className="bg-[#06f]" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Vis autofullfør-knapper</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Slå på for å vise godta/bla-knapper</p>
              </div>
              <Switch 
                checked={autocompleteButton}
                onCheckedChange={(value) => {
                  console.log('Switch component: Autocomplete button toggled to:', value);
                  handleAutocompleteButtonChange(value);
                }}
                className="bg-[#06f]" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dokumentbeskrivelse</Label>
            <Textarea 
              id="prompt" 
              placeholder="Skriv inn din dokumentbeskrivelse for å instruere Innhold.AI" 
              className="h-24 resize-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              value={vipPrompt}
              onChange={handleVipPromptChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation-style" className="text-sm text-gray-900 dark:text-gray-100">Kildehenvisningsstil</Label>
            <CustomDropdown 
              value={citationStyle} 
              onChange={handleCitationStyleChange} 
              options={citationStyles} 
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Kildehenvisninger</Label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Automatisk sitering fra eksterne kilder</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kildehenvisninger fra nettet vil bli vurdert</p>
              </div>
              <Switch 
                checked={externalCiting}
                onCheckedChange={(value) => {
                  console.log('Switch component: External citing toggled to:', value);
                  handleExternalCitingChange(value);
                }}
                className="bg-[#06f]" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Automatisk sitering fra bibliotek</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bibliotekkilder vil bli vurdert</p>
              </div>
              <Switch 
                checked={localCiting}
                onCheckedChange={(value) => {
                  console.log('Switch component: Local citing toggled to:', value);
                  handleLocalCitingChange(value);
                }}
                className="bg-[#06f]" 
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SlideOutSettingsPanel;
