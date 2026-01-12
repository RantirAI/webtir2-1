import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComponentInstance } from '../store/types';
import { useBuilderStore } from '../store/useBuilderStore';
import { Menu, X } from 'lucide-react';

interface ResponsiveNavWrapperProps {
  instance: ComponentInstance;
  children: React.ReactNode;
  isPreviewMode?: boolean;
  currentBreakpoint?: string;
}

/**
 * Wraps composition-based navigation (Section with htmlTag='nav') to provide
 * responsive behavior with hamburger menu on mobile.
 */
export const ResponsiveNavWrapper: React.FC<ResponsiveNavWrapperProps> = ({
  instance,
  children,
  isPreviewMode = false,
  currentBreakpoint = 'base',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const mobileBreakpoint = instance.props?.mobileBreakpoint ?? 768;
  const mobileAnimation = instance.props?.mobileAnimation ?? 'slide';
  const animationDuration = instance.props?.animationDuration ?? 300;

  // Determine if we should show mobile view based on breakpoint or viewport
  useEffect(() => {
    const checkViewport = () => {
      if (isPreviewMode) {
        setIsMobileView(window.innerWidth < mobileBreakpoint);
      } else {
        const mobileBreakpoints = ['mobile', 'mobileLandscape'];
        setIsMobileView(mobileBreakpoints.includes(currentBreakpoint));
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [isPreviewMode, currentBreakpoint, mobileBreakpoint]);

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

  // Find logo and menu items from composition children
  const navContent = useMemo(() => {
    // Navigate: Section > Container > [Logo, LinksDiv, CTA]
    const container = instance.children?.[0];
    if (!container || container.type !== 'Container') {
      return { logo: null, links: null, cta: null };
    }

    let logo: ComponentInstance | null = null;
    let links: ComponentInstance | null = null;
    let cta: ComponentInstance | null = null;

    for (const child of container.children || []) {
      // Logo: Text or Image with 'logo' in label or first Text/Image
      if ((child.type === 'Text' || child.type === 'Image') && !logo) {
        logo = child;
      }
      // Links container: Div with Link children
      if (child.type === 'Div' && child.children?.some((c) => c.type === 'Link')) {
        links = child;
      }
      // CTA: Button
      if (child.type === 'Button') {
        cta = child;
      }
    }

    return { logo, links, cta, container };
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
              isLast={index === (navContent.links?.children?.length ?? 0) - 1}
            />
          ))}

          {/* CTA at bottom */}
          {navContent.cta && (
            <div className="mt-3 pb-2">
              <MobileCTARenderer cta={navContent.cta} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Helper components for rendering mobile nav items
const MobileLogoRenderer: React.FC<{ logo: ComponentInstance }> = ({ logo }) => {
  if (logo.type === 'Image') {
    return (
      <img
        src={logo.props?.src || ''}
        alt={logo.props?.alt || 'Logo'}
        className="h-8 w-auto max-w-[120px] object-contain"
        style={{ maxHeight: '32px' }}
      />
    );
  }

  // Text logo
  return (
    <span className="text-xl font-bold text-foreground">
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

  return (
    <a
      href={href}
      className={`py-3 text-sm text-foreground hover:text-primary transition-colors ${
        !isLast ? 'border-b border-border' : ''
      }`}
    >
      {text}
    </a>
  );
};

const MobileCTARenderer: React.FC<{ cta: ComponentInstance }> = ({ cta }) => {
  const text = cta.props?.children || cta.props?.text || 'Get Started';
  const href = cta.props?.href || '#';

  return (
    <a
      href={href}
      className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium text-center hover:opacity-90 transition-opacity"
    >
      {text}
    </a>
  );
};

export default ResponsiveNavWrapper;
