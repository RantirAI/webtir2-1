// Navigation Layout Templates - Slot-Based Architecture
// Each template defines how logo, menu, and CTA are distributed across Left/Center/Right slots

export type NavigationTemplate =
  | 'logo-left-menu-right'
  | 'logo-right-menu-left'
  | 'logo-center-split'
  | 'stacked-center'
  | 'center-hamburger'
  | 'logo-left-menu-center'
  | 'minimal-logo'
  | 'mega-menu';

export type SlotElement = 'logo' | 'menu' | 'cta' | 'hamburger';

export interface SlotPlacement {
  left: SlotElement[];
  center: SlotElement[];
  right: SlotElement[];
}

export interface SlotStyles {
  left: Record<string, string>;
  center: Record<string, string>;
  right: Record<string, string>;
}

export interface TemplateConfig {
  id: NavigationTemplate;
  label: string;
  description: string;
  placement: SlotPlacement;
  containerStyles: Record<string, string>;
  slotStyles: SlotStyles;
  hideMenu?: boolean;
  splitMenu?: boolean;
  stacked?: boolean;
}

// Define all 8 templates with slot-based configurations
export const navigationTemplates: Record<NavigationTemplate, TemplateConfig> = {
  'logo-left-menu-right': {
    id: 'logo-left-menu-right',
    label: 'Logo Left + Menu Right',
    description: 'Standard horizontal navbar with logo on left',
    placement: {
      left: ['logo'],
      center: [],
      right: ['menu', 'cta'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'center',
      },
      right: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '24px',
      },
    },
  },

  'logo-right-menu-left': {
    id: 'logo-right-menu-left',
    label: 'Logo Right + Menu Left',
    description: 'Mirrored layout with logo on right',
    placement: {
      left: ['menu'],
      center: [],
      right: ['cta', 'logo'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '24px',
      },
      center: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'center',
      },
      right: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '16px',
      },
    },
  },

  'logo-center-split': {
    id: 'logo-center-split',
    label: 'Logo Center + Split Menu',
    description: 'Centered logo with menu items split on both sides',
    placement: {
      left: ['menu'],
      center: ['logo'],
      right: ['menu', 'cta'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '24px',
      },
      center: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'center',
      },
      right: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '24px',
      },
    },
    splitMenu: true,
  },

  'stacked-center': {
    id: 'stacked-center',
    label: 'Stacked Center',
    description: 'Logo on top, menu centered below',
    placement: {
      left: [],
      center: ['logo', 'menu', 'cta'],
      right: [],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      },
      right: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    },
    stacked: true,
  },

  'center-hamburger': {
    id: 'center-hamburger',
    label: 'Center Logo + Hamburger',
    description: 'Centered logo with hamburger menu toggle',
    placement: {
      left: ['hamburger'],
      center: ['logo'],
      right: ['cta'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'center',
      },
      right: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    },
    hideMenu: true,
  },

  'logo-left-menu-center': {
    id: 'logo-left-menu-center',
    label: 'Logo Left + Menu Center',
    description: 'Logo on left, menu centered, CTA on right',
    placement: {
      left: ['logo'],
      center: ['menu'],
      right: ['cta'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      },
      right: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    },
  },

  'minimal-logo': {
    id: 'minimal-logo',
    label: 'Minimal (Logo Only)',
    description: 'Clean minimal navbar with just logo',
    placement: {
      left: ['logo'],
      center: [],
      right: [],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'center',
      },
      right: {
        display: 'none',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    },
    hideMenu: true,
  },

  'mega-menu': {
    id: 'mega-menu',
    label: 'Mega Menu Layout',
    description: 'Full-width dropdown menu support',
    placement: {
      left: ['logo'],
      center: ['menu'],
      right: ['cta'],
    },
    containerStyles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '32px',
      width: '100%',
    },
    slotStyles: {
      left: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      center: {
        display: 'flex',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
      },
      right: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    },
  },
};

// Get template config by ID
export function getTemplateConfig(template: NavigationTemplate): TemplateConfig {
  return navigationTemplates[template];
}

// Get all templates as array for dropdowns
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(navigationTemplates);
}

// Template visual preview icons (simple ASCII representations)
export const templatePreviews: Record<NavigationTemplate, { left: string; center: string; right: string }> = {
  'logo-left-menu-right': { left: '■', center: '', right: '― ― ―' },
  'logo-right-menu-left': { left: '― ― ―', center: '', right: '■' },
  'logo-center-split': { left: '― ―', center: '■', right: '― ―' },
  'stacked-center': { left: '', center: '■', right: '' },
  'center-hamburger': { left: '☰', center: '■', right: '○' },
  'logo-left-menu-center': { left: '■', center: '― ― ―', right: '○' },
  'minimal-logo': { left: '■', center: '', right: '' },
  'mega-menu': { left: '■', center: '▼ ▼ ▼', right: '○' },
};
