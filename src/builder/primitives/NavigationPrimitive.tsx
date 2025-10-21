import React, { useState } from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';
import { Menu, X } from 'lucide-react';

interface NavigationPrimitiveProps {
  instanceId: string;
  logo?: string;
  menuItems?: { text: string; url: string; id: string }[];
  alignment?: 'left-right' | 'center' | 'right-left';
  mobileAnimation?: 'none' | 'slide' | 'fade' | 'scale';
  animationDuration?: number;
  hamburgerStyle?: 'classic' | 'minimal' | 'dots';
  animateIcon?: boolean;
  isSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const NavigationPrimitive: React.FC<NavigationPrimitiveProps> = ({
  instanceId,
  logo = 'Logo',
  menuItems = [
    { text: 'Home', url: '#', id: '1' },
    { text: 'About', url: '#', id: '2' },
    { text: 'Contact', url: '#', id: '3' },
  ],
  alignment = 'left-right',
  mobileAnimation = 'slide',
  animationDuration = 300,
  hamburgerStyle = 'classic',
  animateIcon = true,
  isSelected = false,
  className = '',
  style = {},
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { updateInstance } = useBuilderStore();

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

  // Determine flex alignment based on prop
  const getFlexAlignment = () => {
    switch (alignment) {
      case 'center':
        return 'justify-center';
      case 'right-left':
        return 'justify-end';
      default: // 'left-right'
        return 'justify-between';
    }
  };

  // Animation classes for mobile menu
  const getMobileAnimationClasses = () => {
    if (!isMobileMenuOpen) return 'opacity-0 pointer-events-none';
    
    switch (mobileAnimation) {
      case 'slide':
        return 'opacity-100 translate-y-0';
      case 'fade':
        return 'opacity-100';
      case 'scale':
        return 'opacity-100 scale-100';
      default:
        return 'opacity-100';
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
      default: // classic
        return <Menu className="w-6 h-6" />;
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={`w-full ${className}`}
      style={style}
      data-instance-id={instanceId}
    >
      <div className={`flex items-center ${getFlexAlignment()} px-6 py-4`}>
        {/* Logo */}
        <div className="flex-shrink-0">
          <EditableText
            value={logo}
            onChange={handleLogoChange}
            as="span"
            className="text-lg font-bold"
            isSelected={isSelected}
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <EditableText
              key={item.id}
              value={item.text}
              onChange={(newValue) => handleMenuItemChange(item.id, newValue)}
              as="a"
              className="hover:opacity-70 transition-opacity cursor-pointer"
              isSelected={isSelected}
            />
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex-shrink-0 p-2 -mr-2"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {hamburgerIcon()}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all ${getInitialMobileClasses()} ${getMobileAnimationClasses()}`}
        style={{ 
          transitionDuration: `${animationDuration}ms`,
          transitionProperty: 'opacity, transform'
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col px-6 py-4 border-t border-border">
          {menuItems.map((item) => (
            <EditableText
              key={item.id}
              value={item.text}
              onChange={(newValue) => handleMenuItemChange(item.id, newValue)}
              as="a"
              className="py-3 hover:opacity-70 transition-opacity cursor-pointer border-b border-border last:border-b-0"
              isSelected={isSelected}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};
