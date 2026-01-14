import React, { useState } from 'react';
import { BuildSummary, BuildEdit, BuildStep } from '../store/useBuildProgressStore';
import { ChevronDown, ChevronRight, Check, Package, Palette, Settings2, Image, Sparkles, Eye, Pencil, Zap } from 'lucide-react';
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

  const getStepIcon = (type: BuildStep['type']) => {
    switch (type) {
      case 'analyzing':
        return <Sparkles className="w-3 h-3" />;
      case 'reading':
        return <Eye className="w-3 h-3" />;
      case 'creating':
        return <Package className="w-3 h-3" />;
      case 'styling':
        return <Palette className="w-3 h-3" />;
      case 'generating':
        return <Zap className="w-3 h-3" />;
      default:
        return <Pencil className="w-3 h-3" />;
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

  const getStepLabel = (step: BuildStep) => {
    if (step.target) {
      return `${step.description} → ${step.target}`;
    }
    return step.description;
  };

  // Safely handle potentially undefined arrays (for backwards compatibility)
  const steps = summary.steps || [];
  const edits = summary.edits || [];

  // Combine edits and steps for the collapsible section
  const totalItems = edits.length + steps.length;

  return (
    <div className="rounded-lg bg-background/80 border border-border/50 overflow-hidden">
      {/* Duration at TOP */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30">
        <Check className="w-3 h-3 text-green-500" />
        <span className="text-[9px] text-muted-foreground">
          Built in {summary.duration}s
        </span>
      </div>

      {/* Steps & Edits section in MIDDLE - only show if there are items */}
      {totalItems > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 transition-colors border-b border-border/30">
              <div className="flex items-center gap-1.5">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="font-medium text-[9px]">
                  {edits.length} edit{edits.length !== 1 ? 's' : ''} made
                </span>
              </div>
              <span className="text-muted-foreground text-[8px]">
                {isExpanded ? 'Hide' : 'Show all'}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-2 space-y-1 border-b border-border/30">
              {/* Show steps first */}
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="flex items-start gap-1.5 py-0.5 px-1.5 rounded bg-muted/30 text-[9px]"
                >
                  <span className="text-primary mt-0.5">{getStepIcon(step.type)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground/80 block truncate">{getStepLabel(step)}</span>
                    {step.detail && (
                      <span className="text-muted-foreground text-[8px] block truncate">{step.detail}</span>
                    )}
                  </div>
                  <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                </div>
              ))}
              
              {/* Then show edits */}
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

      {/* Success message at BOTTOM */}
      <div className="flex items-start gap-2 px-3 py-2 bg-green-500/10">
        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check className="w-2.5 h-2.5 text-green-500" />
        </div>
        <span className="text-[10px] font-medium text-foreground leading-tight">
          {summary.message || 'Build completed successfully!'}
        </span>
      </div>
    </div>
  );
};
