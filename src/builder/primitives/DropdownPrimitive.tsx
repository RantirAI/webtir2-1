import React, { useState, useRef, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { ChevronDown } from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface DropdownPrimitiveProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const DropdownPrimitive: React.FC<DropdownPrimitiveProps> = ({
  instance,
  children,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  // Get config from dropdownConfig (new typed approach)
  const dropdownConfig = instance.dropdownConfig || {};
  const triggerText = instance.props?.triggerText || 'Dropdown';
  const openOnHover = dropdownConfig.openOnHover ?? instance.props?.openOnHover ?? false;
  const closeDelay = dropdownConfig.closeDelayMs ?? instance.props?.closeDelay ?? 0;
  const menuItems = instance.props?.menuItems || [
    { label: 'Option 1', href: '#' },
    { label: 'Option 2', href: '#' },
    { label: 'Option 3', href: '#' },
  ];

  // In builder mode, use dropdownConfig.isOpen to show/hide for styling
  // In preview mode, use local isOpen state for actual interaction
  const forceMenuOpen = !isPreviewMode && dropdownConfig.isOpen;
  const showMenu = isPreviewMode ? isOpen : forceMenuOpen;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isPreviewMode) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPreviewMode]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewMode) {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (isPreviewMode && openOnHover) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsOpen(true);
    }
    onHover?.();
  };

  const handleMouseLeave = () => {
    if (isPreviewMode && openOnHover) {
      if (closeDelay > 0) {
        closeTimeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, closeDelay);
      } else {
        setIsOpen(false);
      }
    }
    onHoverEnd?.();
  };

  const handleTriggerTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, triggerText: newText }
    });
  };

  const handleMenuItemChange = (index: number, newLabel: string) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], label: newLabel };
    updateInstance(instance.id, {
      props: { ...instance.props, menuItems: newItems }
    });
  };

  // Get class names from style sources
  const classNames = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');

  // Get computed styles
  const computedStyles = useStyleStore.getState().getComputedStyles(instance.styleSourceIds || []);

  // Apply visibility
  const visibilityStyle = instance.visibility === 'hidden' ? { display: 'none' } : {};

  // Build custom attributes
  const customAttrs: Record<string, string> = {};
  if (instance.attributes) {
    Object.entries(instance.attributes).forEach(([key, value]) => {
      customAttrs[key] = value;
    });
  }
  // Add dropdown-specific data attributes for runtime
  if (openOnHover) customAttrs['data-open-on-hover'] = 'true';
  if (closeDelay > 0) customAttrs['data-close-delay'] = String(closeDelay);

  return (
    <div
      ref={dropdownRef}
      data-instance-id={instance.id}
      id={instance.idAttribute || undefined}
      className={`relative inline-block ${classNames}`}
      style={{ ...computedStyles, ...visibilityStyle } as React.CSSProperties}
      onClick={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={isPreviewMode ? undefined : onContextMenu}
      {...customAttrs}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-accent transition-colors"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        {isPreviewMode ? (
          <span>{triggerText}</span>
        ) : (
          <EditableText
            value={triggerText}
            onChange={handleTriggerTextChange}
            as="span"
          />
        )}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div 
          className="absolute top-full left-0 mt-1 min-w-[180px] rounded-md border border-border bg-background shadow-lg z-50"
          data-dropdown-menu
          role="menu"
        >
          <div className="py-1">
            {/* Render children if they exist (composite structure) */}
            {instance.children && instance.children.length > 0 ? (
              children
            ) : (
              /* Otherwise render default menu items */
              menuItems.map((item: { label: string; href: string }, index: number) => (
                <div
                  key={index}
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent cursor-pointer"
                  role="menuitem"
                  onClick={(e) => {
                    if (isPreviewMode) {
                      e.stopPropagation();
                      setIsOpen(false);
                      // Navigate if href exists
                      if (item.href && item.href !== '#') {
                        window.location.href = item.href;
                      }
                    }
                  }}
                >
                  {isPreviewMode ? (
                    <span>{item.label}</span>
                  ) : (
                    <EditableText
                      value={item.label}
                      onChange={(newLabel) => handleMenuItemChange(index, newLabel)}
                      as="span"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
