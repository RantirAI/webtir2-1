import { ClientRect, CollisionDetection, CollisionDescriptor } from '@dnd-kit/core';
import { Coordinates } from '@dnd-kit/utilities';

/**
 * Custom collision detection that prioritizes the deepest nested droppable
 * under the pointer. This ensures that when dragging into a newly created
 * Section or nested container, it's correctly identified as the drop target
 * instead of falling back to the canvas/body.
 */
export const deepestContainerCollision: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
  pointerCoordinates,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const collisions: CollisionDescriptor[] = [];

  // Find all droppables that contain the pointer
  for (const droppableContainer of droppableContainers) {
    const { id } = droppableContainer;
    const rect = droppableRects.get(id);

    if (!rect) {
      continue;
    }

    // Check if pointer is within this droppable's bounds
    if (isPointInRect(pointerCoordinates, rect)) {
      // Calculate the depth by checking DOM nesting level
      const element = droppableContainer.node.current;
      const depth = element ? getElementDepth(element) : 0;

      // Get the instance type to prioritize actual containers over canvas
      const instanceType = droppableContainer.data.current?.type;
      const isActualContainer = ['Box', 'Container', 'Section'].includes(instanceType || '');
      
      // Boost depth for actual container components to ensure they're prioritized
      const adjustedDepth = isActualContainer ? depth + 100 : depth;

      collisions.push({
        id,
        data: {
          droppableContainer,
          value: adjustedDepth,
        },
      });
    }
  }

  // Sort by depth (deepest first) and then by size (smaller first as tiebreaker)
  return collisions.sort((a, b) => {
    const depthDiff = (b.data?.value || 0) - (a.data?.value || 0);
    
    if (depthDiff !== 0) {
      return depthDiff;
    }

    // If depths are equal, prefer smaller containers (more specific targets)
    const rectA = droppableRects.get(a.id);
    const rectB = droppableRects.get(b.id);

    if (rectA && rectB) {
      const areaA = rectA.width * rectA.height;
      const areaB = rectB.width * rectB.height;
      return areaA - areaB;
    }

    return 0;
  });
};

/**
 * Check if a point is within a rectangle
 */
function isPointInRect(point: Coordinates, rect: ClientRect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
}

/**
 * Calculate the DOM depth of an element (how many ancestors it has)
 */
function getElementDepth(element: Element): number {
  let depth = 0;
  let current: Element | null = element;

  while (current && current.parentElement) {
    // Count only droppable containers to avoid inflated depth from non-structural elements
    if (
      current.hasAttribute('data-droppable-id') ||
      current.hasAttribute('data-instance-id')
    ) {
      depth++;
    }
    current = current.parentElement;
  }

  return depth;
}
