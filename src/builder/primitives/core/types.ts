/**
 * Core Primitive Types
 * 
 * This file defines the types and interfaces for the split-file architecture.
 * Components are split into:
 * - .core.tsx: Locked core logic (rendering, media handling, style bindings)
 * - .editable.tsx: User-editable parts (custom slots, props, scoped CSS)
 * - index.tsx: Composed export that combines both
 */

import { ComponentInstance } from '../../store/types';

/**
 * Base props shared by all primitives
 */
export interface BasePrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
  dataBindingProps?: Record<string, any>;
}

/**
 * Core component props - passed to the locked core logic
 */
export interface CoreComponentProps extends BasePrimitiveProps {
  /** Rendered content from editable slots */
  slots?: Record<string, React.ReactNode>;
  /** Custom styles injected from editable layer */
  customStyles?: React.CSSProperties;
  /** Custom class names from editable layer */
  customClassName?: string;
}

/**
 * Editable component props - for user-customizable layer
 */
export interface EditableComponentProps extends BasePrimitiveProps {
  /** Render prop for custom slot content */
  renderSlot?: (slotName: string, defaultContent: React.ReactNode) => React.ReactNode;
}

/**
 * Lock region definition for code editor
 */
export interface LockRegion {
  /** Unique identifier for the region */
  id: string;
  /** Start line (1-indexed) */
  startLine: number;
  /** End line (1-indexed) */
  endLine: number;
  /** Type of locked region */
  type: 'core-logic' | 'style-binding' | 'media-handling' | 'structure';
  /** Human-readable description */
  description: string;
  /** Whether this region can be unlocked by advanced users */
  allowUnlock: boolean;
}

/**
 * Component lock metadata
 */
export interface ComponentLockMetadata {
  /** Component name */
  componentName: string;
  /** File path */
  filePath: string;
  /** Locked regions within the file */
  lockRegions: LockRegion[];
  /** Editable slots available */
  editableSlots: string[];
  /** Whether the entire component is locked */
  isFullyLocked: boolean;
  /** Version for tracking changes */
  version: string;
}

/**
 * Lock marker constants used in code comments
 */
export const LOCK_MARKERS = {
  START: '@lock-start',
  END: '@lock-end',
  EDITABLE_START: '@editable',
  EDITABLE_END: '@editable-end',
  SLOT: '@slot',
  CORE_FILE: '@core-file',
  EDITABLE_FILE: '@editable-file',
} as const;

/**
 * Parse lock regions from code content
 */
export function parseLockRegions(code: string): LockRegion[] {
  const lines = code.split('\n');
  const regions: LockRegion[] = [];
  let currentRegion: Partial<LockRegion> | null = null;
  let regionId = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for lock-start marker
    const startMatch = line.match(/\/\/\s*@lock-start:\s*(\S+)(?:\s+(.*))?/);
    if (startMatch) {
      currentRegion = {
        id: `lock-${regionId++}`,
        startLine: lineNumber,
        type: parseRegionType(startMatch[1]),
        description: startMatch[2] || startMatch[1],
        allowUnlock: !line.includes('no-unlock'),
      };
    }

    // Check for lock-end marker
    if (line.includes(LOCK_MARKERS.END) && currentRegion) {
      regions.push({
        ...currentRegion,
        endLine: lineNumber,
      } as LockRegion);
      currentRegion = null;
    }
  });

  return regions;
}

/**
 * Parse editable regions from code content
 */
export function parseEditableRegions(code: string): { startLine: number; endLine: number; name: string }[] {
  const lines = code.split('\n');
  const regions: { startLine: number; endLine: number; name: string }[] = [];
  let currentRegion: { startLine: number; name: string } | null = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for editable-start marker
    const startMatch = line.match(/\/\/\s*@editable:\s*(\S+)/);
    if (startMatch) {
      currentRegion = {
        startLine: lineNumber,
        name: startMatch[1],
      };
    }

    // Check for editable-end marker
    if (line.includes(LOCK_MARKERS.EDITABLE_END) && currentRegion) {
      regions.push({
        ...currentRegion,
        endLine: lineNumber,
      });
      currentRegion = null;
    }
  });

  return regions;
}

function parseRegionType(type: string): LockRegion['type'] {
  switch (type.toLowerCase()) {
    case 'core':
    case 'core-logic':
      return 'core-logic';
    case 'style':
    case 'style-binding':
      return 'style-binding';
    case 'media':
    case 'media-handling':
      return 'media-handling';
    case 'structure':
      return 'structure';
    default:
      return 'core-logic';
  }
}

/**
 * Check if a line number is within any locked region
 */
export function isLineLocked(lineNumber: number, lockRegions: LockRegion[]): boolean {
  return lockRegions.some(
    region => lineNumber >= region.startLine && lineNumber <= region.endLine
  );
}

/**
 * Check if a line number is within any editable region
 */
export function isLineEditable(
  lineNumber: number, 
  editableRegions: { startLine: number; endLine: number }[]
): boolean {
  return editableRegions.some(
    region => lineNumber >= region.startLine && lineNumber <= region.endLine
  );
}

/**
 * Get the lock status for a specific line
 */
export function getLineStatus(
  lineNumber: number,
  lockRegions: LockRegion[],
  editableRegions: { startLine: number; endLine: number }[]
): 'locked' | 'editable' | 'unlocked' {
  if (isLineEditable(lineNumber, editableRegions)) {
    return 'editable';
  }
  if (isLineLocked(lineNumber, lockRegions)) {
    return 'locked';
  }
  return 'unlocked';
}
