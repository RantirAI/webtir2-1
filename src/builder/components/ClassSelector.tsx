import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { useStyleStore } from '../store/useStyleStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { styleSources, isClassEditable, getClassDependents, setClassDependency, removeClassDependency } = useStyleStore();
  
  // Get all existing class names for autocomplete
  const allClassNames = Object.values(styleSources)
    .filter(source => source.type === 'local')
    .map(source => source.name);
  
  // Filter classes that aren't already selected
  const selectedClassNames = selectedClasses.map(c => c.name);
  const availableClasses = allClassNames.filter(
    name => !selectedClassNames.includes(name) && name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Update dependencies when classes change
  useEffect(() => {
    if (selectedClasses.length >= 2) {
      // Each class depends on its immediate predecessor
      for (let i = 1; i < selectedClasses.length; i++) {
        const baseClass = selectedClasses[i - 1];
        const dependentClass = selectedClasses[i];
        setClassDependency(baseClass.id, dependentClass.id);
      }
    }
  }, [selectedClasses, setClassDependency]);

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
      
      // Remove dependency tracking when removing a class
      if (selectedClasses.length >= 2) {
        const previousClass = selectedClasses[selectedClasses.length - 2];
        removeClassDependency(previousClass.id, lastClass.id);
      }
      
      onRemoveClass(lastClass.id);
    }
  };

  const handleSelectExisting = (className: string) => {
    onAddClass(className);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveClass = (classId: string, index: number) => {
    // Check if this class has dependents
    const dependents = getClassDependents(classId);
    if (dependents.length > 0) {
      // Cannot remove - show warning in console or UI
      console.warn(`Cannot remove class - it has ${dependents.length} dependent class(es)`);
      return;
    }
    
    // Remove dependency from previous class
    if (index > 0) {
      const previousClass = selectedClasses[index - 1];
      removeClassDependency(previousClass.id, classId);
    }
    
    onRemoveClass(classId);
  };

  useEffect(() => {
    // Show dropdown when typing
    if (inputValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [inputValue]);

  // Check if active class is editable
  const activeClass = activeClassIndex !== null ? selectedClasses[activeClassIndex] : null;
  const isActiveClassEditable = activeClass ? isClassEditable(activeClass.id) : true;
  const activeClassDependents = activeClass ? getClassDependents(activeClass.id) : [];

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Warning banner for locked classes */}
        {!isActiveClassEditable && activeClassDependents.length > 0 && (
          <Alert className="mb-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-300">
              Cannot modify <span className="font-mono font-semibold">.{activeClass?.name}</span> - Class {activeClassIndex! + 2} depends on it. 
              Remove dependent classes first to edit.
            </AlertDescription>
          </Alert>
        )}

        <Popover open={isOpen && availableClasses.length > 0} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              className="flex flex-wrap items-center gap-1 p-1.5 border border-border rounded-md bg-background cursor-text min-h-[36px] hover:border-primary/50 transition-colors"
              onClick={() => inputRef.current?.focus()}
            >
              {selectedClasses.map((cls, index) => {
                const isActive = activeClassIndex === index;
                const isPrimary = cls.isPrimary;
                const editable = isClassEditable(cls.id);
                const dependents = getClassDependents(cls.id);
                const isLastClass = index === selectedClasses.length - 1;
                
                return (
                  <Tooltip key={cls.id}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onClassClick(cls.id, index);
                        }}
                        className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono cursor-pointer
                          transition-all relative
                          ${isPrimary 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                          }
                          ${isActive ? 'ring-2 ring-offset-1 ring-primary' : ''}
                          ${!editable ? 'opacity-60' : 'hover:opacity-80'}
                        `}
                      >
                        {!editable && (
                          <Lock className="w-3 h-3 mr-0.5 text-muted-foreground" />
                        )}
                        <span className="select-none">.{cls.name}</span>
                        {isPrimary && (
                          <span className="text-[9px] opacity-60 font-sans">CLASS {index + 1}</span>
                        )}
                        {!isPrimary && (
                          <span className="text-[9px] opacity-60 font-sans">CLASS {index + 1}</span>
                        )}
                        {isLastClass && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClass(cls.id, index);
                            }}
                            className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5"
                            disabled={!editable}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {editable ? (
                        <div>
                          <div className="font-semibold">Class {index + 1}: Editable</div>
                          {index > 0 && <div className="text-muted-foreground">Inherits from Class {index}</div>}
                          {isLastClass && <div className="text-muted-foreground">Click X to remove</div>}
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold">Class {index + 1}: Read-Only</div>
                          <div className="text-muted-foreground">
                            Protected by {dependents.length} dependent class{dependents.length > 1 ? 'es' : ''}
                          </div>
                          <div className="text-muted-foreground text-[10px] mt-1">
                            Remove Class {index + 2} to edit this class
                          </div>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedClasses.length === 0 ? "+ Add Class 1 (Enter)" : "+ Add Class " + (selectedClasses.length + 1)}
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
        
        <div className="text-[10px] text-muted-foreground mt-2 space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Class 1 (Primary)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Class 2+ (Inherits)</span>
            </div>
          </div>
          <div className="text-[9px] opacity-70">
            • Each class inherits from its predecessor<br />
            • Only the last class in the chain is editable<br />
            • Remove dependent classes to unlock editing
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};