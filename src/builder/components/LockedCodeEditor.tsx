/**
 * Locked Code Editor
 * 
 * An enhanced code editor that enforces read-only regions based on lock markers.
 * Provides visual distinction between locked and editable sections.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { parseLockRegions, parseEditableRegions, getLineStatus, LockRegion, LOCK_MARKERS } from '../primitives/core/types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

interface LockedCodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  /** Whether to enforce locking (default: true) */
  enforceLocking?: boolean;
  /** Callback when user attempts to edit locked region */
  onLockedEditAttempt?: (region: LockRegion) => void;
  /** Whether to allow advanced unlock mode */
  allowUnlock?: boolean;
  /** File path for context */
  filePath?: string;
}

export const LockedCodeEditor: React.FC<LockedCodeEditorProps> = ({
  code,
  language,
  onChange,
  enforceLocking = true,
  onLockedEditAttempt,
  allowUnlock = false,
  filePath,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockWarning, setShowUnlockWarning] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);

  // Parse lock and editable regions
  const lockRegions = useMemo(() => parseLockRegions(code), [code]);
  const editableRegions = useMemo(() => parseEditableRegions(code), [code]);

  // Check if file is a core file (fully locked)
  const isCoreFile = useMemo(() => {
    return code.includes(LOCK_MARKERS.CORE_FILE) || filePath?.includes('.core.');
  }, [code, filePath]);

  // Determine if current cursor position is in a locked region
  const isCursorInLockedRegion = useMemo(() => {
    if (!enforceLocking || isUnlocked) return false;
    const status = getLineStatus(cursorLine, lockRegions, editableRegions);
    return status === 'locked' || (isCoreFile && status !== 'editable');
  }, [cursorLine, lockRegions, editableRegions, enforceLocking, isUnlocked, isCoreFile]);

  // Syntax highlighting
  useEffect(() => {
    if (preRef.current) {
      const highlighted = Prism.highlight(
        code,
        Prism.languages[language] || Prism.languages.markup,
        language
      );
      preRef.current.innerHTML = highlighted;
    }
  }, [code, language]);

  // Update cursor line on selection change
  const updateCursorLine = useCallback(() => {
    if (textareaRef.current) {
      const text = textareaRef.current.value;
      const cursorPos = textareaRef.current.selectionStart;
      const lineNumber = text.substring(0, cursorPos).split('\n').length;
      setCursorLine(lineNumber);
    }
  }, []);

  // Handle key events to prevent editing locked regions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!enforceLocking || isUnlocked) return;

    const isModifyingKey = !e.ctrlKey && !e.metaKey && !e.altKey && 
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'Tab'].includes(e.key);

    if (isModifyingKey && isCursorInLockedRegion) {
      e.preventDefault();
      
      // Find which region the cursor is in
      const region = lockRegions.find(
        r => cursorLine >= r.startLine && cursorLine <= r.endLine
      );
      
      if (region) {
        onLockedEditAttempt?.(region);
      }
    }
  }, [enforceLocking, isUnlocked, isCursorInLockedRegion, cursorLine, lockRegions, onLockedEditAttempt]);

  // Handle paste in locked regions
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!enforceLocking || isUnlocked) return;

    if (isCursorInLockedRegion) {
      e.preventDefault();
      const region = lockRegions.find(
        r => cursorLine >= r.startLine && cursorLine <= r.endLine
      );
      if (region) {
        onLockedEditAttempt?.(region);
      }
    }
  }, [enforceLocking, isUnlocked, isCursorInLockedRegion, cursorLine, lockRegions, onLockedEditAttempt]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Additional validation could be added here
    onChange(e.target.value);
  }, [onChange]);

  // Scroll sync
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Generate line numbers with lock indicators
  const lineCount = code.split('\n').length;
  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => {
      const lineNum = i + 1;
      const status = getLineStatus(lineNum, lockRegions, editableRegions);
      const isLocked = status === 'locked' || (isCoreFile && status !== 'editable');
      const isEditable = status === 'editable';
      
      return {
        number: lineNum,
        isLocked: isLocked && !isUnlocked,
        isEditable,
      };
    });
  }, [lineCount, lockRegions, editableRegions, isCoreFile, isUnlocked]);

  const handleUnlockClick = () => {
    if (!isUnlocked) {
      setShowUnlockWarning(true);
    } else {
      setIsUnlocked(false);
    }
  };

  const confirmUnlock = () => {
    setIsUnlocked(true);
    setShowUnlockWarning(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      {/* Toolbar */}
      {(lockRegions.length > 0 || isCoreFile) && (
        <div className="h-8 bg-muted/30 border-b border-border flex items-center justify-between px-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>
              {isCoreFile 
                ? 'Core file - Read only (critical logic)' 
                : `${lockRegions.length} locked region${lockRegions.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>
          
          {allowUnlock && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={handleUnlockClick}
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="h-3 w-3" />
                        Lock
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Unlock
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isUnlocked 
                    ? 'Re-enable code protection' 
                    : 'Unlock for advanced editing (risky)'
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Unlock Warning Dialog */}
      {showUnlockWarning && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Unlock Protected Code?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will allow you to edit locked regions containing critical logic. 
                  Modifying this code may break:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                  <li>Style system bindings</li>
                  <li>Media rendering</li>
                  <li>Component structure</li>
                  <li>Builder interactions</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnlockWarning(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmUnlock}
              >
                Unlock Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers with Lock Indicators */}
        <div
          ref={lineNumbersRef}
          className="w-12 flex-shrink-0 bg-muted/20 border-r border-border select-none"
          style={{ paddingTop: '1rem', overflowY: 'hidden', overflowX: 'hidden' }}
        >
          {lineNumbers.map(({ number, isLocked, isEditable }) => (
            <div
              key={number}
              className={`
                h-6 leading-6 text-xs font-mono text-right pr-2 flex items-center justify-end gap-1
                ${cursorLine === number ? 'bg-muted/50' : ''}
                ${isLocked ? 'text-muted-foreground/50' : isEditable ? 'text-green-500' : 'text-muted-foreground'}
              `}
            >
              {isLocked && <Lock className="h-2.5 w-2.5" />}
              {number}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          {/* Syntax Highlighted Display */}
          <pre
            ref={preRef}
            className="absolute inset-0 p-4 m-0 pointer-events-none font-mono text-sm leading-6 bg-transparent"
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              wordWrap: 'normal',
              overflowY: 'auto',
              overflowX: 'auto',
            }}
          />

          {/* Lock overlay for locked lines */}
          {enforceLocking && !isUnlocked && (
            <div 
              className="absolute left-0 right-0 pointer-events-none"
              style={{ paddingTop: '1rem' }}
            >
              {lineNumbers.map(({ number, isLocked }) => (
                isLocked && (
                  <div
                    key={number}
                    className="h-6 bg-muted/20 border-l-2 border-muted-foreground/20"
                  />
                )
              ))}
            </div>
          )}

          {/* Editable Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onSelect={updateCursorLine}
            onClick={updateCursorLine}
            onKeyUp={updateCursorLine}
            spellCheck={false}
            className={`
              absolute inset-0 p-4 m-0 font-mono text-sm leading-6 
              bg-transparent text-transparent caret-foreground 
              resize-none focus:outline-none selection:bg-primary/30
              ${isCursorInLockedRegion ? 'cursor-not-allowed' : ''}
            `}
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              wordWrap: 'normal',
              overflowY: 'auto',
              overflowX: 'auto',
              caretColor: isCursorInLockedRegion ? 'transparent' : 'hsl(var(--foreground))',
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-muted/30 border-t border-border flex items-center justify-between px-3 text-xs text-muted-foreground">
        <span>Ln {cursorLine}</span>
        <span>
          {isCursorInLockedRegion ? (
            <span className="text-yellow-500 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Read only
            </span>
          ) : (
            <span className="text-green-500">Editable</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default LockedCodeEditor;
