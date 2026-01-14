import React, { useState, useEffect } from 'react';
import { useBuildProgressStore } from '../store/useBuildProgressStore';
import { Loader2, ChevronDown, ChevronRight, Sparkles, Eye, Package, Palette, Zap, Pencil, Check } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const BuildProgressCard: React.FC = () => {
  const {
    isBuilding,
    startTime,
    taskTitle,
    taskDescription,
    steps,
  } = useBuildProgressStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isBuilding || !startTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isBuilding, startTime]);

  if (!isBuilding) {
    return null;
  }

  const getStepIcon = (type: string) => {
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

  const completedSteps = steps.filter(s => s.completed).length;
  const currentStep = steps.find(s => !s.completed) || steps[steps.length - 1];

  return (
    <div className="text-[10px] rounded-lg bg-muted mr-4 overflow-hidden animate-fade-in">
      {/* Thinking timer */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
        <span className="text-muted-foreground">
          Thinking for {elapsedSeconds}s
        </span>
      </div>

      {/* Current task card */}
      {taskTitle && (
        <div className="mx-2 my-2 p-2 rounded-md bg-background/50 border border-border/50">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{taskTitle}</p>
              <p className="text-muted-foreground mt-0.5 line-clamp-2">{taskDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Steps progress - collapsible */}
      {steps.length > 0 && (
        <Collapsible open={isStepsExpanded} onOpenChange={setIsStepsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-background/30 transition-colors border-t border-border/50">
              <div className="flex items-center gap-1.5">
                {isStepsExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="font-medium text-[9px]">
                  {completedSteps > 0 ? `${completedSteps} step${completedSteps !== 1 ? 's' : ''} completed` : 'Processing...'}
                </span>
              </div>
              <span className="text-muted-foreground text-[8px]">
                {isStepsExpanded ? 'Hide' : 'Show all'}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-2 space-y-0.5">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-1.5 py-0.5 px-1.5 rounded text-[9px] ${
                    step.completed ? 'bg-muted/30' : 'bg-primary/10 border border-primary/20'
                  }`}
                >
                  <span className={`mt-0.5 ${step.completed ? 'text-muted-foreground' : 'text-primary'}`}>
                    {getStepIcon(step.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`block truncate ${step.completed ? 'text-foreground/60' : 'text-foreground'}`}>
                      {step.description}
                      {step.target && <span className="text-muted-foreground"> → {step.target}</span>}
                    </span>
                    {step.detail && (
                      <span className="text-muted-foreground text-[8px] block truncate">{step.detail}</span>
                    )}
                  </div>
                  {step.completed ? (
                    <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-primary mt-0.5 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Current step indicator when collapsed */}
      {!isStepsExpanded && currentStep && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5 py-0.5 px-1.5 rounded bg-primary/10 border border-primary/20 text-[9px]">
            <span className="text-primary">{getStepIcon(currentStep.type)}</span>
            <span className="text-foreground truncate flex-1">{currentStep.description}</span>
            <Loader2 className="w-2.5 h-2.5 animate-spin text-primary flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};
