import React, { useState, useEffect } from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';
import { Menu, X } from 'lucide-react';
import webtirLogo from '@/assets/webtir-sdk-logo.png';
import { NavigationTemplate, getTemplateConfig } from '../utils/navigationTemplates';

interface MenuItem {
  text: string;
  url: string;
  id: string;
}

interface NavigationPrimitiveProps {
  instanceId: string;
  logo?: string;
  logoImage?: string;
  menuItems?: MenuItem[];
  template?: NavigationTemplate;
  showCTA?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  mobileBreakpoint?: number;
  mobileAnimation?: 'none' | 'slide' | 'fade' | 'scale';
  animationDuration?: number;
  hamburgerStyle?: 'classic' | 'minimal' | 'dots';
  animateIcon?: boolean;
  isSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isPreviewMode?: boolean;
  currentBreakpoint?: string;
}

export const NavigationPrimitive: React.FC<NavigationPrimitiveProps> = ({
  instanceId,
  logo = 'Logo',
  logoImage,
  menuItems = [
    { text: 'Home', url: '#', id: '1' },
    { text: 'About', url: '#', id: '2' },
    { text: 'Services', url: '#', id: '3' },
    { text: 'Contact', url: '#', id: '4' },
  ],
  template = 'logo-left-menu-right',
  showCTA = true,
  ctaText = 'Get Started',
  ctaUrl = '#',
  mobileBreakpoint = 768,
  mobileAnimation = 'slide',
  animationDuration = 300,
  hamburgerStyle = 'classic',
  animateIcon = true,
  isSelected = false,
  className = '',
  style = {},
  children,
  isPreviewMode = false,
  currentBreakpoint = 'base',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const { updateInstance } = useBuilderStore();

  const templateConfig = getTemplateConfig(template);

  // Determine if we should show mobile view based on breakpoint or viewport
  useEffect(() => {
    const checkViewport = () => {
      // In preview mode, use actual viewport width
      if (isPreviewMode) {
        setIsMobileView(window.innerWidth < mobileBreakpoint);
      } else {
        // In builder mode, check if current breakpoint is mobile
        const mobileBreakpoints = ['mobile', 'mobileLandscape'];
        setIsMobileView(mobileBreakpoints.includes(currentBreakpoint));
      }
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [isPreviewMode, currentBreakpoint, mobileBreakpoint]);

  const handleLogoChange = (newValue: string) => {
    updateInstance(instanceId, {
      props: { logo: newValue }
    });
  };

  const handleMenuItemChange = (itemId: string, newValue: string) => {
    const updatedItems = menuItems.map(item => 
      item.id === itemId ? { ...item, text: newValue } : item
    );
    updateInstance(instanceId, {
      props: { menuItems: updatedItems }
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Animation classes for mobile menu
  const getMobileAnimationClasses = () => {
    if (!isMobileMenuOpen) return 'opacity-0 pointer-events-none max-h-0';
    
    switch (mobileAnimation) {
      case 'slide':
        return 'opacity-100 translate-y-0 max-h-96';
      case 'fade':
        return 'opacity-100 max-h-96';
      case 'scale':
        return 'opacity-100 scale-100 max-h-96';
      default:
        return 'opacity-100 max-h-96';
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

  const hamburgerIcon = () => {
    if (animateIcon && isMobileMenuOpen) {
      return <X className="w-6 h-6" />;
    }
    
    switch (hamburgerStyle) {
      case 'minimal':
        return (
          <div className="flex flex-col gap-1.5 w-6">
            <div className="h-0.5 bg-current" />
            <div className="h-0.5 bg-current" />
          </div>
        );
      case 'dots':
        return (
          <div className="flex gap-1 w-6 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        );
      default:
        return <Menu className="w-6 h-6" />;
    }
  };

  // Get layout styles based on template
  const getNavStyles = (): React.CSSProperties => {
    const { layout } = templateConfig;
    return {
      display: 'flex',
      flexDirection: layout.flexDirection,
      justifyContent: layout.justifyContent,
      alignItems: layout.alignItems,
      gap: layout.gap,
      width: '100%',
      padding: '16px 24px',
      ...style,
    };
  };

  const getLogoBoxStyles = (): React.CSSProperties => {
    const { logoBox } = templateConfig;
    return {
      order: logoBox.order,
      marginLeft: logoBox.marginLeft,
      marginRight: logoBox.marginRight,
      flexShrink: 0,
    };
  };

  const getLinksBoxStyles = (): React.CSSProperties => {
    const { linksBox } = templateConfig;
    return {
      order: linksBox.order,
      display: template === 'minimal-logo' ? 'none' : 'flex',
      justifyContent: linksBox.justifyContent,
      alignItems: 'center',
      gap: '32px',
      flexGrow: linksBox.flexGrow,
      marginLeft: linksBox.marginLeft,
      marginRight: linksBox.marginRight,
    };
  };

  const getButtonBoxStyles = (): React.CSSProperties => {
    const { buttonBox } = templateConfig;
    if (!buttonBox) return { display: 'none' };
    return {
      order: buttonBox.order,
      marginLeft: buttonBox.marginLeft,
      flexShrink: 0,
    };
  };

  // Split menu items for center-split template
  const getLeftMenuItems = () => {
    if (template === 'logo-center-split') {
      return menuItems.slice(0, Math.ceil(menuItems.length / 2));
    }
    return [];
  };

  const getRightMenuItems = () => {
    if (template === 'logo-center-split') {
      return menuItems.slice(Math.ceil(menuItems.length / 2));
    }
    return menuItems;
  };

  // Render logo component
  const renderLogo = () => (
    <div style={getLogoBoxStyles()}>
      {logoImage ? (
        <img src={logoImage} alt={logo} className="h-8 w-auto" />
      ) : (
        <EditableText
          value={logo}
          onChange={handleLogoChange}
          as="span"
          className="text-xl font-bold"
          isSelected={isSelected}
        />
      )}
    </div>
  );

  // Render menu items
  const renderMenuItems = (items: MenuItem[]) => (
    <>
      {items.map((item) => (
        <EditableText
          key={item.id}
          value={item.text}
          onChange={(newValue) => handleMenuItemChange(item.id, newValue)}
          as="a"
          className="hover:opacity-70 transition-opacity cursor-pointer text-sm font-medium"
          isSelected={isSelected}
        />
      ))}
    </>
  );

  // Render CTA button
  const renderCTA = () => {
    if (!showCTA) return null;
    return (
      <div style={getButtonBoxStyles()}>
        {children || (
          <a
            href={ctaUrl}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {ctaText}
          </a>
        )}
      </div>
    );
  };

  // Mobile view rendering
  if (isMobileView) {
    const { mobile } = templateConfig;
    
    return (
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={className}
        style={{ width: '100%', ...style }}
        data-instance-id={instanceId}
      >
        <div 
          className="flex items-center w-full px-4 py-3"
          style={{
            justifyContent: mobile.logoPosition === 'center' ? 'center' : 'space-between',
          }}
        >
          {/* Hamburger on left */}
          {mobile.hamburgerPosition === 'left' && (
            <button
              className="p-2 -ml-2"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {hamburgerIcon()}
            </button>
          )}

          {/* Logo */}
          <div className={mobile.logoPosition === 'center' ? 'absolute left-1/2 -translate-x-1/2' : ''}>
            {logoImage ? (
              <img src={logoImage} alt={logo} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold">{logo}</span>
            )}
          </div>

          {/* Hamburger on right */}
          {mobile.hamburgerPosition === 'right' && (
            <button
              className="p-2 -mr-2"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {hamburgerIcon()}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`overflow-hidden transition-all ${getInitialMobileClasses()} ${getMobileAnimationClasses()}`}
          style={{ 
            transitionDuration: `${animationDuration}ms`,
            transitionProperty: 'opacity, transform, max-height'
          }}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex flex-col px-4 py-2 border-t border-border">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="py-3 hover:opacity-70 transition-opacity cursor-pointer border-b border-border last:border-b-0 text-sm"
              >
                {item.text}
              </a>
            ))}
            {showCTA && (
              <a
                href={ctaUrl}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium text-center"
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Desktop view - template-based rendering
  if (template === 'logo-center-split') {
    return (
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={className}
        style={getNavStyles()}
        data-instance-id={instanceId}
      >
        {/* Left menu items */}
        <div style={{ ...getLinksBoxStyles(), order: 1, justifyContent: 'flex-end', flexGrow: 1 }}>
          {renderMenuItems(getLeftMenuItems())}
        </div>

        {/* Center logo */}
        <div style={{ order: 2, flexShrink: 0 }}>
          {renderLogo()}
        </div>

        {/* Right menu items */}
        <div style={{ ...getLinksBoxStyles(), order: 3, justifyContent: 'flex-start', flexGrow: 1 }}>
          {renderMenuItems(getRightMenuItems())}
        </div>

        {/* CTA */}
        {showCTA && (
          <div style={{ order: 4, flexShrink: 0 }}>
            {children || (
              <a
                href={ctaUrl}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {ctaText}
              </a>
            )}
          </div>
        )}
      </nav>
    );
  }

  // Stacked template
  if (template === 'stacked-center') {
    return (
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={className}
        style={{ ...style, width: '100%' }}
        data-instance-id={instanceId}
      >
        <div className="flex flex-col items-center gap-4 py-4 px-6">
          {renderLogo()}
          <div className="flex items-center gap-8">
            {renderMenuItems(menuItems)}
          </div>
          {renderCTA()}
        </div>
      </nav>
    );
  }

  // Default template-based rendering
  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={className}
      style={getNavStyles()}
      data-instance-id={instanceId}
    >
      {renderLogo()}
      
      <div style={getLinksBoxStyles()}>
        {renderMenuItems(getRightMenuItems())}
      </div>

      {renderCTA()}
    </nav>
  );
};
