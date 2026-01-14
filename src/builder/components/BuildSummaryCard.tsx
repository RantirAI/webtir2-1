import React, { useState } from 'react';
import { BuildSummary, BuildEdit } from '../store/useBuildProgressStore';
import { ChevronDown, ChevronRight, Check, Package, Palette, Settings2, Image } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BuildSummaryCardProps {
  summary: BuildSummary;
}

export const BuildSummaryCard: React.FC<BuildSummaryCardProps> = ({ summary }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEditIcon = (type: BuildEdit['type']) => {
    switch (type) {
      case 'component':
        return <Package className="w-3 h-3" />;
      case 'style':
        return <Palette className="w-3 h-3" />;
      case 'prop':
        return <Settings2 className="w-3 h-3" />;
      case 'image':
        return <Image className="w-3 h-3" />;
      default:
        return <Check className="w-3 h-3" />;
    }
  };

  const getEditLabel = (edit: BuildEdit) => {
    const actionLabels = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
    };
    return `${actionLabels[edit.action]} ${edit.name}`;
  };

  if (summary.edits.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md bg-background/50 border border-border/50 overflow-hidden">
      {/* Header with duration */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/30">
        <Check className="w-3 h-3 text-green-500" />
        <span className="text-muted-foreground text-[9px]">
          Built in {summary.duration}s
        </span>
      </div>

      {/* Edits section */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-1.5">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="font-medium text-[9px]">
                {summary.edits.length} edit{summary.edits.length !== 1 ? 's' : ''} made
              </span>
            </div>
            <span className="text-muted-foreground text-[8px]">
              {isExpanded ? 'Hide' : 'Show all'}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 pb-1.5 space-y-0.5">
            {summary.edits.map((edit, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 py-0.5 px-1.5 rounded bg-muted/30 text-[9px]"
              >
                <span className="text-muted-foreground">{getEditIcon(edit.type)}</span>
                <span className="text-foreground/80 truncate">{getEditLabel(edit)}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
