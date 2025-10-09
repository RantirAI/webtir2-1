import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface ContainerProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const Container: React.FC<ContainerProps> = ({
  instance,
  children,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
}) => {
  const containerType = instance.props.containerType || 'container';
  const columnLayout = instance.props.columnLayout || 'none';

  // Get column layout class based on the selected layout
  const getColumnLayoutClass = () => {
    switch (columnLayout) {
      case 'single':
        return 'grid grid-cols-1';
      case 'two-equal':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'three-equal':
        return 'grid grid-cols-1 md:grid-cols-3 gap-4';
      case 'three-unequal':
        // Three unequal columns: 25% - 50% - 25% on desktop
        return 'grid grid-cols-1 md:grid-cols-4 gap-4';
      case 'two-nested':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      default:
        return '';
    }
  };

  // Render children with special handling for three-unequal
  const renderChildren = () => {
    if (columnLayout === 'three-unequal' && children && Array.isArray(children)) {
      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Apply col-span classes: first column spans 1, second spans 2, third spans 1
          const colSpanClass = index === 1 ? 'md:col-span-2' : 'md:col-span-1';
          return (
            <div className={colSpanClass}>
              {child}
            </div>
          );
        }
        return child;
      });
    }
    return children;
  };

  return (
    <div
      data-instance-id={instance.id}
      className={`${containerType} ${getColumnLayoutClass()} ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHoverEnd?.();
      }}
      onContextMenu={onContextMenu}
    >
      {renderChildren()}
    </div>
  );
};
