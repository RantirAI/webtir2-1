import React, { useState, useEffect } from 'react';
import { useBuildProgressStore, BuildEdit } from '../store/useBuildProgressStore';
import { ChevronDown, ChevronRight, Check, Loader2, Package, Palette, Settings2, Image } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const BuildProgressCard: React.FC = () => {
  const {
    isBuilding,
    startTime,
    taskTitle,
    taskDescription,
    edits,
    isExpanded,
    toggleExpanded,
  } = useBuildProgressStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  if (!isBuilding && edits.length === 0) {
    return null;
  }

  return (
    <div className="text-[10px] rounded-lg bg-muted mr-4 overflow-hidden animate-fade-in">
      {/* Thinking timer */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        {isBuilding ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <Check className="w-3 h-3 text-green-500" />
        )}
        <span className="text-muted-foreground">
          {isBuilding ? `Thinking for ${elapsedSeconds}s` : `Thought for ${elapsedSeconds}s`}
        </span>
      </div>

      {/* Task card */}
      {taskTitle && (
        <div className="mx-2 my-2 p-2 rounded-md bg-background/50 border border-border/50">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{taskTitle}</p>
              <p className="text-muted-foreground mt-0.5 line-clamp-2">{taskDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edits section */}
      {edits.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={toggleExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-background/30 transition-colors">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="font-medium">{edits.length} edit{edits.length !== 1 ? 's' : ''} made</span>
              </div>
              <span className="text-muted-foreground text-[9px]">
                {isExpanded ? 'Hide' : 'Show all'}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-2 space-y-1">
              {edits.map((edit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 py-1 px-2 rounded bg-background/30"
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
