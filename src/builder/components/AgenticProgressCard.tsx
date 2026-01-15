import React, { useState, useEffect } from 'react';
import { useBuildProgressStore } from '../store/useBuildProgressStore';
import { Loader2, ChevronDown, ChevronRight, Sparkles, Check, Wrench } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const AgenticProgressCard: React.FC = () => {
  const {
    isBuilding,
    startTime,
    steps,
    agentMessages,
    streamingIntent,
  } = useBuildProgressStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

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

  // Animate lines appearing one by one
  useEffect(() => {
    if (agentMessages.length > displayedLines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, agentMessages[prev.length]]);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [agentMessages, displayedLines.length]);

  // Reset displayed lines when agentMessages changes completely
  useEffect(() => {
    if (agentMessages.length === 0) {
      setDisplayedLines([]);
    }
  }, [agentMessages]);

  if (!isBuilding) {
    return null;
  }

  const completedSteps = steps.filter(s => s.completed).length;
  const currentStep = steps.find(s => !s.completed) || steps[steps.length - 1];

  return (
    <div className="text-[10px] rounded-lg bg-muted mr-4 overflow-hidden animate-fade-in">
      {/* Thinking timer - top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-muted-foreground">
          Thinking for {elapsedSeconds}s
        </span>
      </div>

      {/* Agent intent message - streaming line by line */}
      <div className="px-3 py-2.5 space-y-1.5">
        {displayedLines.map((line, index) => (
          <p
            key={index}
            className="text-foreground leading-relaxed animate-line-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {line}
          </p>
        ))}
        {streamingIntent && (
          <p className="text-foreground leading-relaxed animate-line-in">
            {streamingIntent}
            <span className="inline-block w-1.5 h-3 bg-primary/60 ml-0.5 animate-pulse" />
          </p>
        )}
      </div>

      {/* Current task with pulse indicator */}
      {currentStep && (
        <div className="mx-3 mb-2 p-2 rounded-md bg-background/50 border border-border/50">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{currentStep.description}</p>
              {currentStep.detail && (
                <p className="text-muted-foreground mt-0.5 text-[9px]">{currentStep.detail}</p>
              )}
            </div>
            <Loader2 className="w-3 h-3 animate-spin text-primary flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Collapsible tools/steps section */}
      {steps.length > 1 && (
        <Collapsible open={isStepsExpanded} onOpenChange={setIsStepsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-background/30 transition-colors border-t border-border/50">
              <div className="flex items-center gap-1.5">
                {isStepsExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <Wrench className="w-3 h-3 text-muted-foreground" />
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
              {steps.slice(0, -1).map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 py-0.5 px-1.5 rounded bg-muted/30 text-[9px]"
                >
                  <Sparkles className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-foreground/60 truncate flex-1">{step.description}</span>
                  {step.completed && (
                    <Check className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
