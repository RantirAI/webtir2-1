import { ClientRect, CollisionDetection, CollisionDescriptor } from '@dnd-kit/core';
import { Coordinates } from '@dnd-kit/utilities';
import { canDropInside } from './instance';

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
    let rect = droppableRects.get(id);

    // If rect is missing or has zero dimensions, try to find the actual element
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      // Try to find the instance element by data-droppable-id or data-instance-id
      const droppableId = id.toString().replace('droppable-', '');
      const instanceEl = document.querySelector(`[data-instance-id="${droppableId}"]`) ||
                         document.querySelector(`[data-droppable-id="${droppableId}"]`);
      
      if (instanceEl) {
        const domRect = instanceEl.getBoundingClientRect();
        rect = {
          width: domRect.width,
          height: domRect.height,
          top: domRect.top,
          left: domRect.left,
          right: domRect.right,
          bottom: domRect.bottom,
        } as ClientRect;
      }
    }

    if (!rect || (rect.width === 0 && rect.height === 0)) {
      continue;
    }

    // Check if pointer is within this droppable's bounds
    if (isPointInRect(pointerCoordinates, rect)) {
      // Calculate the depth by checking DOM nesting level
      const element = droppableContainer.node.current;
      const depth = element ? getElementDepth(element) : 0;

      // Get the instance type to prioritize actual containers over canvas
      const instanceType = droppableContainer.data.current?.type;
      
      // Use canDropInside to determine if this is a valid container
      // This includes all prebuilt components and their child primitives
      const isActualContainer = canDropInside(instanceType || '');
      
      // Boost depth for actual container components to ensure they're prioritized
      // Higher boost for more specific containers
      const containerBoost = isActualContainer ? 1000 : 0;
      const areaBonus = 1000 / (rect.width * rect.height + 1); // Smaller = higher priority
      const adjustedDepth = depth + containerBoost + areaBonus;

      collisions.push({
        id,
        data: {
          droppableContainer,
          value: adjustedDepth,
        },
      });
    }
  }

  // Sort by adjusted depth (highest first = deepest/smallest container)
  return collisions.sort((a, b) => {
    return (b.data?.value || 0) - (a.data?.value || 0);
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
