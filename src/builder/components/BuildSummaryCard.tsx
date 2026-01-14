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

  return (
    <div className="rounded-lg bg-background/80 border border-border/50 overflow-hidden">
      {/* Success Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border-b border-border/30">
        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-green-500" />
        </div>
        <span className="text-[10px] font-medium text-foreground">
          {summary.message || 'Build completed successfully!'}
        </span>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30">
        <Check className="w-3 h-3 text-green-500" />
        <span className="text-[9px] text-muted-foreground">
          Built in {summary.duration}s
        </span>
      </div>

      {/* Edits section - only show if there are edits */}
      {summary.edits.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 transition-colors">
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
            <div className="px-3 pb-2 space-y-0.5">
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
      )}
    </div>
  );
};
