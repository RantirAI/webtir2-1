// Navigation template definitions and layout configurations

export type NavigationTemplate = 
  | 'logo-left-menu-right'
  | 'logo-right-menu-left'
  | 'logo-center-split'
  | 'stacked-center'
  | 'center-hamburger'
  | 'logo-left-menu-center'
  | 'minimal-logo'
  | 'mega-menu';

export interface TemplateConfig {
  id: NavigationTemplate;
  label: string;
  description: string;
  layout: {
    flexDirection: 'row' | 'column';
    justifyContent: string;
    alignItems: string;
    gap: string;
  };
  logoBox: {
    order: number;
    justifySelf?: string;
    alignSelf?: string;
    marginLeft?: string;
    marginRight?: string;
  };
  linksBox: {
    order: number;
    justifyContent: string;
    flexGrow?: number;
    marginLeft?: string;
    marginRight?: string;
  };
  buttonBox?: {
    order: number;
    marginLeft?: string;
  };
  mobile: {
    hamburgerPosition: 'right' | 'left';
    logoPosition: 'left' | 'center' | 'right';
  };
}

export const navigationTemplates: Record<NavigationTemplate, TemplateConfig> = {
  'logo-left-menu-right': {
    id: 'logo-left-menu-right',
    label: 'Logo Left + Menu Right',
    description: 'Standard horizontal navbar with logo on left, menu on right',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
    },
    logoBox: {
      order: 1,
    },
    linksBox: {
      order: 2,
      justifyContent: 'flex-end',
      flexGrow: 1,
    },
    buttonBox: {
      order: 3,
      marginLeft: '16px',
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'left',
    },
  },

  'logo-right-menu-left': {
    id: 'logo-right-menu-left',
    label: 'Logo Right + Menu Left',
    description: 'Mirrored layout with logo on right, menu on left',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
    },
    logoBox: {
      order: 3,
    },
    linksBox: {
      order: 1,
      justifyContent: 'flex-start',
      flexGrow: 1,
    },
    buttonBox: {
      order: 2,
      marginLeft: 'auto',
    },
    mobile: {
      hamburgerPosition: 'left',
      logoPosition: 'right',
    },
  },

  'logo-center-split': {
    id: 'logo-center-split',
    label: 'Logo Center + Split Menu',
    description: 'Logo centered with menu items split on both sides',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '32px',
    },
    logoBox: {
      order: 2,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    linksBox: {
      order: 1,
      justifyContent: 'flex-start',
    },
    buttonBox: {
      order: 3,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'center',
    },
  },

  'stacked-center': {
    id: 'stacked-center',
    label: 'Stacked (Logo Top, Menu Bottom)',
    description: 'Logo centered at top, menu bar directly below',
    layout: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
    },
    logoBox: {
      order: 1,
    },
    linksBox: {
      order: 2,
      justifyContent: 'center',
    },
    buttonBox: {
      order: 3,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'center',
    },
  },

  'center-hamburger': {
    id: 'center-hamburger',
    label: 'Center Logo + Hamburger Right',
    description: 'Logo centered, hamburger menu on right (clean minimal)',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
    },
    logoBox: {
      order: 2,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    linksBox: {
      order: 3,
      justifyContent: 'flex-end',
    },
    buttonBox: {
      order: 1,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'center',
    },
  },

  'logo-left-menu-center': {
    id: 'logo-left-menu-center',
    label: 'Logo Left + Menu Center',
    description: 'Logo docked left, menu centered in navbar',
    layout: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '24px',
    },
    logoBox: {
      order: 1,
    },
    linksBox: {
      order: 2,
      justifyContent: 'center',
      flexGrow: 1,
    },
    buttonBox: {
      order: 3,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'left',
    },
  },

  'minimal-logo': {
    id: 'minimal-logo',
    label: 'Minimal (Logo Left Only)',
    description: 'Clean layout with just logo, no menu (for landing pages)',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '24px',
    },
    logoBox: {
      order: 1,
    },
    linksBox: {
      order: 2,
      justifyContent: 'flex-end',
      flexGrow: 1,
    },
    buttonBox: {
      order: 3,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'left',
    },
  },

  'mega-menu': {
    id: 'mega-menu',
    label: 'Mega Menu Layout',
    description: 'Full-width navigation with space for large dropdowns',
    layout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '32px',
    },
    logoBox: {
      order: 1,
    },
    linksBox: {
      order: 2,
      justifyContent: 'center',
      flexGrow: 1,
    },
    buttonBox: {
      order: 3,
    },
    mobile: {
      hamburgerPosition: 'right',
      logoPosition: 'left',
    },
  },
};

export function getTemplateConfig(template: NavigationTemplate): TemplateConfig {
  return navigationTemplates[template];
}

export function applyTemplateToStyles(
  template: NavigationTemplate,
  navStyleId: string,
  logoBoxStyleId: string,
  linksBoxStyleId: string,
  buttonBoxStyleId: string | undefined,
  setStyle: (styleId: string, property: string, value: any) => void
): void {
  const config = getTemplateConfig(template);

  // Apply main navigation container styles
  setStyle(navStyleId, 'flexDirection', config.layout.flexDirection);
  setStyle(navStyleId, 'justifyContent', config.layout.justifyContent);
  setStyle(navStyleId, 'alignItems', config.layout.alignItems);
  setStyle(navStyleId, 'gap', config.layout.gap);

  // Apply logo box styles
  setStyle(logoBoxStyleId, 'order', config.logoBox.order.toString());
  if (config.logoBox.marginLeft) {
    setStyle(logoBoxStyleId, 'marginLeft', config.logoBox.marginLeft);
  }
  if (config.logoBox.marginRight) {
    setStyle(logoBoxStyleId, 'marginRight', config.logoBox.marginRight);
  }

  // Apply links box styles
  setStyle(linksBoxStyleId, 'order', config.linksBox.order.toString());
  setStyle(linksBoxStyleId, 'justifyContent', config.linksBox.justifyContent);
  if (config.linksBox.flexGrow !== undefined) {
    setStyle(linksBoxStyleId, 'flexGrow', config.linksBox.flexGrow.toString());
  }
  if (config.linksBox.marginLeft) {
    setStyle(linksBoxStyleId, 'marginLeft', config.linksBox.marginLeft);
  }
  if (config.linksBox.marginRight) {
    setStyle(linksBoxStyleId, 'marginRight', config.linksBox.marginRight);
  }

  // Apply button box styles if it exists
  if (buttonBoxStyleId && config.buttonBox) {
    setStyle(buttonBoxStyleId, 'order', config.buttonBox.order.toString());
    if (config.buttonBox.marginLeft) {
      setStyle(buttonBoxStyleId, 'marginLeft', config.buttonBox.marginLeft);
    }
  }

  // Special handling for minimal template - hide links
  if (template === 'minimal-logo') {
    setStyle(linksBoxStyleId, 'display', 'none');
  } else {
    setStyle(linksBoxStyleId, 'display', 'flex');
  }
}
