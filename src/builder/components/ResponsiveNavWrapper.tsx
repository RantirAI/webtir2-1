import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { Menu, X } from 'lucide-react';

interface ResponsiveNavWrapperProps {
  instance: ComponentInstance;
  children: React.ReactNode;
  isPreviewMode?: boolean;
  currentBreakpoint?: string;
  canvasWidth?: number; // Current canvas width for real-time responsive updates
}

/**
 * Helper to get className from styleSourceIds
 */
const getClassFromStyleSources = (instance: ComponentInstance): string => {
  const styleSources = useStyleStore.getState().styleSources;
  return (instance.styleSourceIds || [])
    .map((id) => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');
};

/**
 * Wraps composition-based navigation (Section with htmlTag='nav') to provide
 * responsive behavior with hamburger menu on mobile.
 */
export const ResponsiveNavWrapper: React.FC<ResponsiveNavWrapperProps> = ({
  instance,
  children,
  isPreviewMode = false,
  currentBreakpoint = 'base',
  canvasWidth,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Use tablet breakpoint (991px) for hamburger menu trigger in builder
  const tabletBreakpointWidth = 991;
  const mobileBreakpoint = instance.props?.mobileBreakpoint ?? 768;
  const mobileAnimation = instance.props?.mobileAnimation ?? 'slide';
  const animationDuration = instance.props?.animationDuration ?? 300;

  // Determine if we should show mobile view based on breakpoint, canvas width, or viewport
  useEffect(() => {
    const checkViewport = () => {
      if (isPreviewMode) {
        // In preview mode, use actual window width
        setIsMobileView(window.innerWidth < mobileBreakpoint);
      } else if (canvasWidth !== undefined) {
        // In builder mode with canvas width provided, use it for real-time responsiveness
        setIsMobileView(canvasWidth <= tabletBreakpointWidth);
      } else {
        // Fallback to breakpoint-based detection
        const responsiveBreakpoints = ['mobile', 'mobileLandscape', 'mobile-landscape', 'tablet'];
        setIsMobileView(responsiveBreakpoints.includes(currentBreakpoint));
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [isPreviewMode, currentBreakpoint, mobileBreakpoint, canvasWidth]);

  // Close mobile menu when switching away from mobile view
  useEffect(() => {
    if (!isMobileView) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileView]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Animation classes for mobile menu
  const getMobileAnimationClasses = () => {
    if (!isMobileMenuOpen) return 'opacity-0 pointer-events-none max-h-0';

    switch (mobileAnimation) {
      case 'slide':
        return 'opacity-100 translate-y-0 max-h-[80vh]';
      case 'fade':
        return 'opacity-100 max-h-[80vh]';
      case 'scale':
        return 'opacity-100 scale-100 max-h-[80vh]';
      default:
        return 'opacity-100 max-h-[80vh]';
    }
  };

  const getInitialMobileClasses = () => {
    switch (mobileAnimation) {
      case 'slide':
        return '-translate-y-4';
      case 'scale':
        return 'scale-95';
      default:
        return '';
    }
  };

  // Find logo, links, and other children (Buttons, etc.) from composition children
  const navContent = useMemo(() => {
    // Navigate: Section > Container > [Logo, LinksDiv, Buttons, etc.]
    const container = instance.children?.[0];
    if (!container || container.type !== 'Container') {
      return { logo: null, links: null, otherChildren: [] };
    }

    let logo: ComponentInstance | null = null;
    let links: ComponentInstance | null = null;
    const otherChildren: ComponentInstance[] = [];

    for (const child of container.children || []) {
      // Logo: Text or Image (first one found)
      if ((child.type === 'Text' || child.type === 'Image') && !logo) {
        logo = child;
      }
      // Links container: Div with Link children
      else if (child.type === 'Div' && child.children?.some((c) => c.type === 'Link')) {
        links = child;
      }
      // Any other component (Button, custom components, etc.)
      else if (child.type !== 'Text' && child.type !== 'Image') {
        otherChildren.push(child);
      }
    }

    return { logo, links, otherChildren, container };
  }, [instance]);

  // If not mobile view, render children normally (desktop layout)
  if (!isMobileView) {
    return <>{children}</>;
  }

  // Mobile view: render custom mobile layout
  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      data-instance-id={instance.id}
      className="relative w-full bg-background"
      style={{ position: 'relative' }}
    >
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3">
        {/* Logo slot - find and clone the logo from children */}
        <div className="flex-shrink-0">
          {navContent.logo && (
            <MobileLogoRenderer logo={navContent.logo} />
          )}
        </div>

        {/* Hamburger Button */}
        <button
          className="p-2 -mr-2 text-foreground hover:bg-muted rounded-md transition-colors"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls={`mobile-menu-${instance.id}`}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        id={`mobile-menu-${instance.id}`}
        className={`absolute left-0 right-0 top-full bg-background border-t border-border shadow-lg overflow-hidden transition-all ${getInitialMobileClasses()} ${getMobileAnimationClasses()}`}
        style={{
          transitionDuration: `${animationDuration}ms`,
          transitionProperty: 'opacity, transform, max-height',
          zIndex: 2000,
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col px-4 py-2">
          {/* Render links vertically */}
          {navContent.links?.children?.map((link, index) => (
            <MobileLinkRenderer
              key={link.id}
              link={link}
              isLast={index === (navContent.links?.children?.length ?? 0) - 1 && navContent.otherChildren.length === 0}
            />
          ))}

          {/* Render other children (Buttons, etc.) with their actual styles */}
          {navContent.otherChildren.map((child, index) => (
            <MobileChildRenderer
              key={child.id}
              child={child}
              isLast={index === navContent.otherChildren.length - 1}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

// Helper components for rendering mobile nav items
const MobileLogoRenderer: React.FC<{ logo: ComponentInstance }> = ({ logo }) => {
  const className = getClassFromStyleSources(logo);
  
  if (logo.type === 'Image') {
    return (
      <img
        src={logo.props?.src || ''}
        alt={logo.props?.alt || 'Logo'}
        className={className || "h-8 w-auto max-w-[120px] object-contain"}
        style={{ maxHeight: '32px' }}
      />
    );
  }

  // Text logo - use its actual styles
  return (
    <span className={className || "text-xl font-bold text-foreground"}>
      {logo.props?.children || logo.props?.text || 'Logo'}
    </span>
  );
};

const MobileLinkRenderer: React.FC<{ link: ComponentInstance; isLast: boolean }> = ({
  link,
  isLast,
}) => {
  const href = link.props?.href || '#';
  const text = link.props?.children || link.props?.text || 'Link';
  const className = getClassFromStyleSources(link);

  return (
    <a
      href={href}
      className={`py-3 text-sm transition-colors ${className} ${
        !isLast ? 'border-b border-border' : ''
      }`}
    >
      {text}
    </a>
  );
};

/**
 * Renders any child component (Button, etc.) with its actual styles from styleSourceIds
 */
const MobileChildRenderer: React.FC<{ child: ComponentInstance; isLast: boolean }> = ({ child, isLast }) => {
  const className = getClassFromStyleSources(child);
  
  if (child.type === 'Button') {
    const text = child.props?.children || child.props?.text || 'Button';
    const href = child.props?.href || child.props?.url;
    
    // Base styles for proper display in mobile menu
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginTop: '12px',
      marginBottom: isLast ? '8px' : '0',
    };
    
    if (href) {
      return (
        <a 
          href={href} 
          className={className}
          style={baseStyles}
        >
          {text}
        </a>
      );
    }
    
    return (
      <button 
        className={className}
        style={baseStyles}
      >
        {text}
      </button>
    );
  }
  
  // For other component types, render as a div with their className
  // This is a fallback for custom components
  return (
    <div 
      className={className}
      style={{ marginTop: '12px', marginBottom: isLast ? '8px' : '0' }}
    >
      {child.props?.children || child.props?.text || ''}
    </div>
  );
};

export default ResponsiveNavWrapper;
