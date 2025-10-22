import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeadingSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  currentTag: string;
  currentText: string;
  onTagChange: (tag: string) => void;
  onTextChange: (text: string) => void;
  onShowAllSettings: () => void;
}

export const HeadingSettingsPopover: React.FC<HeadingSettingsPopoverProps> = ({
  isOpen,
  onClose,
  position,
  currentTag,
  currentText,
  onTagChange,
  onTextChange,
  onShowAllSettings,
}) => {
  const [text, setText] = useState(currentText);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState(position);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(currentText);
  }, [currentText]);

  useEffect(() => {
    setPopoverPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.popover-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - popoverPosition.x,
        y: e.clientY - popoverPosition.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPopoverPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onTextChange(newText);
  };

  if (!isOpen) return null;

  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const tagNumbers = ['1', '2', '3', '4', '5', '6'];

  return (
    <div
      ref={popoverRef}
      className="fixed z-[10000] bg-background border border-border rounded-md shadow-xl"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
        width: '200px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable */}
      <div className="popover-header flex items-center justify-between px-1.5 py-1 border-b border-border cursor-grab active:cursor-grabbing">
        <h3 className="text-foreground text-[11px] font-medium">Heading {currentTag.replace('h', '')} Settings</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-1.5 space-y-1.5">
        {/* Tag Selector */}
        <div className="space-y-0.5">
          <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Tag</label>
          <div className="grid grid-cols-6 gap-1">
            {tagNumbers.map((num, index) => (
              <button
                key={num}
                onClick={() => onTagChange(tags[index])}
                className={`h-5 flex items-center justify-center rounded text-[10px] font-medium transition-colors ${
                  currentTag === tags[index]
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-0.5">
          <label className="text-[9px] text-muted-foreground uppercase tracking-wide">Text</label>
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground h-6 text-xs"
          />
        </div>

        {/* Show All Settings Button */}
        <Button
          onClick={() => {
            onShowAllSettings();
            onClose();
          }}
          variant="ghost"
          className="w-full h-6 justify-between text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          Show All Settings
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
