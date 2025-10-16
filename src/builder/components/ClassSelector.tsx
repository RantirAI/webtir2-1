import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStyleStore } from '../store/useStyleStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface ClassSelectorProps {
  selectedClasses: { id: string; name: string; isPrimary: boolean }[];
  onAddClass: (className: string) => void;
  onRemoveClass: (classId: string) => void;
  onClassClick: (classId: string, index: number) => void;
  activeClassIndex: number | null;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClasses,
  onAddClass,
  onRemoveClass,
  onClassClick,
  activeClassIndex,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { styleSources } = useStyleStore();
  
  // Get all existing class names for autocomplete
  const allClassNames = Object.values(styleSources)
    .filter(source => source.type === 'local')
    .map(source => source.name);
  
  // Filter classes that aren't already selected
  const selectedClassNames = selectedClasses.map(c => c.name);
  const availableClasses = allClassNames.filter(
    name => !selectedClassNames.includes(name) && name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const safeName = inputValue.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      if (safeName) {
        onAddClass(safeName);
        setInputValue('');
        setIsOpen(false);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedClasses.length > 0) {
      // Remove last class on backspace when input is empty
      const lastClass = selectedClasses[selectedClasses.length - 1];
      onRemoveClass(lastClass.id);
    }
  };

  const handleSelectExisting = (className: string) => {
    onAddClass(className);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Show dropdown when typing
    if (inputValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [inputValue]);

  return (
    <div className="relative">
      <Popover open={isOpen && availableClasses.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex flex-wrap items-center gap-1 p-1.5 border border-border rounded-md bg-background cursor-text min-h-[36px] hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.focus()}
          >
            {selectedClasses.map((cls, index) => {
              const isActive = activeClassIndex === index;
              const isPrimary = cls.isPrimary;
              
              return (
                <div
                  key={cls.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClassClick(cls.id, index);
                  }}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono cursor-pointer
                    transition-all
                    ${isPrimary 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                    }
                    ${isActive ? 'ring-2 ring-offset-1 ring-primary' : ''}
                    hover:opacity-80
                  `}
                >
                  <span className="select-none">.{cls.name}</span>
                  {isPrimary && (
                    <span className="text-[9px] opacity-60 font-sans">PRIMARY</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveClass(cls.id);
                    }}
                    className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedClasses.length === 0 ? "+ Add class (Enter to confirm)" : ""}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-foreground text-xs font-mono placeholder:text-muted-foreground px-1"
            />
          </div>
        </PopoverTrigger>
        
        {availableClasses.length > 0 && (
          <PopoverContent 
            className="p-0 w-[var(--radix-popover-trigger-width)]" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                <CommandEmpty>No existing classes found</CommandEmpty>
                <CommandGroup heading="Existing Classes">
                  {availableClasses.map((className) => (
                    <CommandItem
                      key={className}
                      onSelect={() => handleSelectExisting(className)}
                      className="text-xs font-mono cursor-pointer"
                    >
                      <span className="text-muted-foreground mr-1">.</span>
                      {className}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      
      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Primary class</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>Combo class</span>
        </div>
      </div>
    </div>
  );
};
