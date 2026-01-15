import React, { useState, useEffect } from 'react';
import { BuildSummary, BuildEdit, BuildStep } from '../store/useBuildProgressStore';
import { ChevronDown, ChevronRight, Check, Package, Palette, Settings2, Image, Sparkles, Wrench } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AgenticSummaryCardProps {
  summary: BuildSummary;
}

export const AgenticSummaryCard: React.FC<AgenticSummaryCardProps> = ({ summary }) => {
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [isEditsExpanded, setIsEditsExpanded] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  // Animate summary message lines appearing
  const summaryLines = summary.agentSummary || [];
  
  useEffect(() => {
    if (summaryLines.length > displayedLines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, summaryLines[prev.length]]);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [summaryLines, displayedLines.length]);

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

  // Safely handle potentially undefined arrays
  const steps = summary.steps || [];
  const edits = summary.edits || [];

  return (
    <div className="rounded-lg bg-background/80 border border-border/50 overflow-hidden">
      {/* Duration at TOP - like "Thought for Xs" */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[9px] text-muted-foreground">
          Thought for {summary.duration}s
        </span>
      </div>

      {/* Agent summary message - line by line */}
      <div className="px-3 py-2.5 space-y-1 border-b border-border/30">
        {displayedLines.map((line, index) => (
          <p
            key={index}
            className="text-[10px] text-foreground leading-relaxed animate-line-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {line}
          </p>
        ))}
        {displayedLines.length === 0 && summary.message && (
          <p className="text-[10px] text-foreground leading-relaxed">
            {summary.message}
          </p>
        )}
      </div>

      {/* Tools used - collapsible */}
      {steps.length > 0 && (
        <Collapsible open={isToolsExpanded} onOpenChange={setIsToolsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 transition-colors border-b border-border/30">
              <div className="flex items-center gap-1.5">
                {isToolsExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <Wrench className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-[9px]">
                  {steps.length} step{steps.length !== 1 ? 's' : ''} completed
                </span>
              </div>
              <span className="text-muted-foreground text-[8px]">
                {isToolsExpanded ? 'Hide' : 'Show all'}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-2 space-y-0.5 border-b border-border/30">
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="flex items-center gap-1.5 py-0.5 px-1.5 rounded bg-muted/30 text-[9px]"
                >
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                  <span className="text-foreground/80 truncate flex-1">{step.description}</span>
                  <Check className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Edits made - collapsible */}
      {edits.length > 0 && (
        <Collapsible open={isEditsExpanded} onOpenChange={setIsEditsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 transition-colors border-b border-border/30">
              <div className="flex items-center gap-1.5">
                {isEditsExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <Package className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-[9px]">
                  {edits.length} edit{edits.length !== 1 ? 's' : ''} made
                </span>
              </div>
              <span className="text-muted-foreground text-[8px]">
                {isEditsExpanded ? 'Hide' : 'Show all'}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-2 space-y-0.5 border-b border-border/30">
              {edits.map((edit, index) => (
                <div
                  key={`edit-${index}`}
                  className="flex items-center gap-1.5 py-0.5 px-1.5 rounded bg-muted/30 text-[9px]"
                >
                  <span className="text-muted-foreground">{getEditIcon(edit.type)}</span>
                  <span className="text-foreground/80 truncate flex-1">{getEditLabel(edit)}</span>
                  <Check className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Success indicator at bottom */}
      <div className="flex items-start gap-2 px-3 py-2 bg-green-500/10">
        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check className="w-2.5 h-2.5 text-green-500" />
        </div>
        <span className="text-[10px] font-medium text-foreground leading-tight">
          Build completed successfully!
        </span>
      </div>
    </div>
  );
};
