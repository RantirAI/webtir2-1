import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

interface HeadingSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTag: string;
  currentText: string;
  onTagChange: (tag: string) => void;
  onTextChange: (text: string) => void;
  onShowAllSettings: () => void;
}

export const HeadingSettings: React.FC<HeadingSettingsProps> = ({
  open,
  onOpenChange,
  currentTag,
  currentText,
  onTagChange,
  onTextChange,
  onShowAllSettings,
}) => {
  const [text, setText] = useState(currentText);
  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const tagNumbers = ['1', '2', '3', '4', '5', '6'];

  const handleTextChange = (newText: string) => {
    setText(newText);
    onTextChange(newText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] bg-[#27272a] border-[#3f3f46] text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-base font-medium">
            Heading {currentTag.replace('h', '')} Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Tag Selector */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400">Tag</label>
            <div className="flex gap-1">
              {tagNumbers.map((num, index) => (
                <button
                  key={num}
                  onClick={() => onTagChange(tags[index])}
                  className={`flex-1 h-9 flex items-center justify-center rounded text-sm font-medium transition-colors ${
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
          <div className="space-y-2">
            <label className="text-xs text-zinc-400">Text</label>
            <Input
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="bg-[#3f3f46] border-[#52525b] text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Show All Settings Button */}
          <Button
            onClick={() => {
              onShowAllSettings();
              onOpenChange(false);
            }}
            variant="ghost"
            className="w-full justify-between text-zinc-300 hover:text-white hover:bg-[#3f3f46]"
          >
            Show All Settings
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
