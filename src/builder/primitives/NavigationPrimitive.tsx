import React, { useState, useEffect } from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';
import { Menu, X } from 'lucide-react';
import { NavigationTemplate, getTemplateConfig } from '../utils/navigationTemplates';

interface MenuItem {
  text: string;
  url: string;
  id: string;
}

type HoverPreset = 'none' | 'underline-slide' | 'background' | 'color-change' | 'scale' | 'glow';
type ActivePreset = 'none' | 'bold' | 'underline' | 'background' | 'dot' | 'border-bottom';

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
  // Hover & Active styles
  hoverPreset?: HoverPreset;
  activePreset?: ActivePreset;
  hoverColor?: string;
  hoverBgColor?: string;
  activeColor?: string;
  activeBgColor?: string;
}

// Generate CSS for hover and active states - exported for use in Canvas.tsx
export const generateLinkStyles = (
  instanceId: string,
  hoverPreset: HoverPreset,
  activePreset: ActivePreset,
  hoverColor: string,
  hoverBgColor: string,
  activeColor: string,
  activeBgColor: string,
  duration: number
): string => {
  const baseTransition = `transition: all ${duration}ms ease;`;
  
  let hoverStyles = '';
  let activeStyles = '';
  let beforeStyles = '';
  
  // Hover preset styles
  switch (hoverPreset) {
    case 'underline-slide':
      beforeStyles = `
        .nav-${instanceId} .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${hoverColor || 'currentColor'};
          transform: scaleX(0);
          transform-origin: right;
          transition: transform ${duration}ms ease;
        }
        .nav-${instanceId} .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `;
      break;
    case 'background':
      hoverStyles = `
        .nav-${instanceId} .nav-link:hover {
          background: ${hoverBgColor || 'rgba(0,0,0,0.05)'};
          border-radius: 4px;
          padding: 4px 8px;
          margin: -4px -8px;
        }
      `;
      break;
    case 'color-change':
      hoverStyles = `
        .nav-${instanceId} .nav-link:hover {
          color: ${hoverColor || '#3b82f6'};
        }
      `;
      break;
    case 'scale':
      hoverStyles = `
        .nav-${instanceId} .nav-link:hover {
          transform: scale(1.05);
        }
      `;
      break;
    case 'glow':
      hoverStyles = `
        .nav-${instanceId} .nav-link:hover {
          text-shadow: 0 0 8px ${hoverColor || 'rgba(59, 130, 246, 0.5)'};
        }
      `;
      break;
  }
  
  // Active preset styles
  switch (activePreset) {
    case 'bold':
      activeStyles = `
        .nav-${instanceId} .nav-link.active {
          font-weight: 700;
        }
      `;
      break;
    case 'underline':
      activeStyles = `
        .nav-${instanceId} .nav-link.active {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: ${activeColor || 'currentColor'};
        }
      `;
      break;
    case 'background':
      activeStyles = `
        .nav-${instanceId} .nav-link.active {
          background: ${activeBgColor || 'rgba(59, 130, 246, 0.1)'};
          color: ${activeColor || '#3b82f6'};
          border-radius: 4px;
          padding: 4px 8px;
          margin: -4px -8px;
        }
      `;
      break;
    case 'dot':
      activeStyles = `
        .nav-${instanceId} .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${activeColor || '#3b82f6'};
        }
      `;
      break;
    case 'border-bottom':
      activeStyles = `
        .nav-${instanceId} .nav-link.active {
          border-bottom: 2px solid ${activeColor || '#3b82f6'};
          padding-bottom: 2px;
        }
      `;
      break;
  }
  
  return `
    .nav-${instanceId} .nav-link {
      position: relative;
      ${baseTransition}
    }
    ${beforeStyles}
    ${hoverStyles}
    ${activeStyles}
  `;
};

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
  hoverPreset = 'underline-slide',
  activePreset = 'underline',
  hoverColor = '',
  hoverBgColor = '',
  activeColor = '',
  activeBgColor = '',
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

  // Get layout styles based on template (using new slot-based structure)
  const getNavStyles = (): React.CSSProperties => {
    const { containerStyles } = templateConfig;
    return {
      display: containerStyles.display || 'flex',
      flexDirection: containerStyles.flexDirection as React.CSSProperties['flexDirection'] || 'row',
      justifyContent: containerStyles.justifyContent || 'space-between',
      alignItems: containerStyles.alignItems || 'center',
      gap: containerStyles.gap || '24px',
      width: '100%',
      padding: '16px 24px',
      ...style,
    };
  };

  const getLogoBoxStyles = (): React.CSSProperties => {
    const { slotStyles, placement } = templateConfig;
    // Determine which slot the logo is in
    const logoInLeft = placement.left.includes('logo');
    const logoInCenter = placement.center.includes('logo');
    const logoInRight = placement.right.includes('logo');
    
    let slotStyle = slotStyles.left;
    if (logoInCenter) slotStyle = slotStyles.center;
    if (logoInRight) slotStyle = slotStyles.right;
    
    return {
      display: slotStyle.display || 'flex',
      flex: slotStyle.flex || '0 0 auto',
      alignItems: slotStyle.alignItems || 'center',
      justifyContent: slotStyle.justifyContent || 'flex-start',
      flexShrink: 0,
    };
  };

  const getLinksBoxStyles = (): React.CSSProperties => {
    const { slotStyles, placement, hideMenu } = templateConfig;
    // Determine which slot the menu is in
    const menuInLeft = placement.left.includes('menu');
    const menuInCenter = placement.center.includes('menu');
    
    let slotStyle = slotStyles.right; // default
    if (menuInLeft) slotStyle = slotStyles.left;
    if (menuInCenter) slotStyle = slotStyles.center;
    
    return {
      display: hideMenu ? 'none' : (slotStyle.display || 'flex'),
      flex: slotStyle.flex || '1',
      justifyContent: slotStyle.justifyContent || 'flex-end',
      alignItems: slotStyle.alignItems || 'center',
      gap: slotStyle.gap || '24px',
    };
  };

  const getButtonBoxStyles = (): React.CSSProperties => {
    const { slotStyles, placement } = templateConfig;
    // CTA is typically in the right slot
    const ctaInLeft = placement.left.includes('cta');
    const ctaInCenter = placement.center.includes('cta');
    
    let slotStyle = slotStyles.right;
    if (ctaInLeft) slotStyle = slotStyles.left;
    if (ctaInCenter) slotStyle = slotStyles.center;
    
    return {
      display: slotStyle.display || 'flex',
      flex: '0 0 auto',
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
        <img 
          src={logoImage} 
          alt={logo} 
          className="h-10 w-auto max-w-[160px] object-contain" 
          style={{ maxHeight: '40px' }}
        />
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

  // Render menu items with hover/active classes
  const renderMenuItems = (items: MenuItem[]) => (
    <>
      {items.map((item, index) => (
        <EditableText
          key={item.id}
          value={item.text}
          onChange={(newValue) => handleMenuItemChange(item.id, newValue)}
          as="a"
          className={`nav-link cursor-pointer text-sm font-medium ${index === 0 ? 'active' : ''}`}
          isSelected={isSelected}
        />
      ))}
    </>
  );

  // Render CTA button - fixed to always show when enabled
  const renderCTA = () => {
    if (!showCTA) return null;
    return (
      <div style={getButtonBoxStyles()}>
        <a
          href={ctaUrl}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity inline-block"
        >
          {ctaText}
        </a>
      </div>
    );
  };

  // Inject dynamic styles for hover/active states
  const dynamicStyles = generateLinkStyles(
    instanceId,
    hoverPreset,
    activePreset,
    hoverColor,
    hoverBgColor,
    activeColor,
    activeBgColor,
    animationDuration
  );

  // Mobile view rendering
  if (isMobileView) {
    return (
      <>
        <style>{dynamicStyles}</style>
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`nav-${instanceId} ${className}`}
          style={{ width: '100%', position: 'relative', ...style }}
          data-instance-id={instanceId}
        >
          {/* Mobile Header Bar */}
          <div 
            className="flex items-center justify-between w-full px-4 py-3"
          >
            {/* Logo on left */}
            <div>
              {logoImage ? (
                <img 
                  src={logoImage} 
                  alt={logo} 
                  className="h-8 w-auto max-w-[120px] object-contain" 
                  style={{ maxHeight: '32px' }}
                />
              ) : (
                <span className="text-xl font-bold">{logo}</span>
              )}
            </div>

            {/* Hamburger on right */}
            <button
              className="p-2 -mr-2"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {hamburgerIcon()}
            </button>
          </div>

          {/* Mobile Menu - Full width below nav with high z-index */}
          <div
            id="mobile-menu"
            className={`absolute left-0 right-0 top-full bg-background border-t border-border shadow-lg overflow-hidden transition-all ${getInitialMobileClasses()} ${getMobileAnimationClasses()}`}
            style={{ 
              transitionDuration: `${animationDuration}ms`,
              transitionProperty: 'opacity, transform, max-height',
              zIndex: 2000,
            }}
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="flex flex-col px-4 py-2">
              {menuItems.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  className={`nav-link py-3 cursor-pointer border-b border-border last:border-b-0 text-sm ${index === 0 ? 'active' : ''}`}
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
      </>
    );
  }

  // Desktop view - template-based rendering
  if (template === 'logo-center-split') {
    return (
      <>
        <style>{dynamicStyles}</style>
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`nav-${instanceId} ${className}`}
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
          {renderCTA()}
        </nav>
      </>
    );
  }

  // Stacked template
  if (template === 'stacked-center') {
    return (
      <>
        <style>{dynamicStyles}</style>
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`nav-${instanceId} ${className}`}
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
      </>
    );
  }

  // Default template-based rendering
  return (
    <>
      <style>{dynamicStyles}</style>
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={`nav-${instanceId} ${className}`}
        style={getNavStyles()}
        data-instance-id={instanceId}
      >
        {renderLogo()}
        
        <div style={getLinksBoxStyles()}>
          {renderMenuItems(getRightMenuItems())}
        </div>

        {renderCTA()}
      </nav>
    </>
  );
};
