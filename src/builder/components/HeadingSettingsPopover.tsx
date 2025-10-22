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
      className="fixed z-[10000] bg-[#27272a] border border-[#3f3f46] rounded-lg shadow-2xl"
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
        width: '280px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable */}
      <div className="popover-header flex items-center justify-between px-3 py-2 border-b border-[#3f3f46] cursor-grab active:cursor-grabbing">
        <h3 className="text-white text-xs font-medium">
          Heading {currentTag.replace('h', '')} Settings
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Tag Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Tag</label>
          <div className="flex gap-1">
            {tagNumbers.map((num, index) => (
              <button
                key={num}
                onClick={() => onTagChange(tags[index])}
                className={`flex-1 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  currentTag === tags[index]
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#3f3f46] text-zinc-300 hover:bg-[#52525b]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Text</label>
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="bg-[#3f3f46] border-[#52525b] text-white placeholder:text-zinc-500 h-8 text-xs"
          />
        </div>

        {/* Show All Settings Button */}
        <Button
          onClick={() => {
            onShowAllSettings();
            onClose();
          }}
          variant="ghost"
          className="w-full h-8 justify-between text-xs text-zinc-300 hover:text-white hover:bg-[#3f3f46]"
        >
          Show All Settings
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
