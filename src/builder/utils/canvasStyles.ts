import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { PseudoState } from '../store/types';

/**
 * Get computed styles for canvas rendering with proper state scoping.
 * Only the selected instance previews the current pseudo-state;
 * all others render in 'default' state.
 * 
 * This prevents pseudo-state styles from "leaking" to unrelated components
 * when editing hover/focus/active/visited styles in the StylePanel.
 */
export function getCanvasComputedStyles(
  instanceId: string,
  styleSourceIds: string[],
  breakpointId?: string
): Record<string, string> {
  const { getComputedStyles, currentPseudoState } = useStyleStore.getState();
  const { selectedInstanceId } = useBuilderStore.getState();
  
  // Only selected instance gets the current pseudo-state preview
  const stateToUse: PseudoState = instanceId === selectedInstanceId 
    ? currentPseudoState 
    : 'default';
  
  return getComputedStyles(styleSourceIds, breakpointId, stateToUse);
}

/**
 * Helper to determine which pseudo-state to use for a given instance.
 * Returns the current pseudo-state only if this is the selected instance,
 * otherwise returns 'default'.
 */
export function getScopedPseudoState(instanceId: string): PseudoState {
  const { currentPseudoState } = useStyleStore.getState();
  const { selectedInstanceId } = useBuilderStore.getState();
  
  return instanceId === selectedInstanceId ? currentPseudoState : 'default';
}
