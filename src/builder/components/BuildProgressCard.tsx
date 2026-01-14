import React, { useState, useEffect } from 'react';
import { useBuildProgressStore } from '../store/useBuildProgressStore';
import { Loader2 } from 'lucide-react';

export const BuildProgressCard: React.FC = () => {
  const {
    isBuilding,
    startTime,
    taskTitle,
    taskDescription,
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

  if (!isBuilding) {
    return null;
  }

  return (
    <div className="text-[10px] rounded-lg bg-muted mr-4 overflow-hidden animate-fade-in">
      {/* Thinking timer */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
        <span className="text-muted-foreground">
          Thinking for {elapsedSeconds}s
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
    </div>
  );
};
