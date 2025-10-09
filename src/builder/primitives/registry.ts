import { ComponentMeta } from '../store/types';

export const componentRegistry: Record<string, ComponentMeta> = {
  Section: {
    type: 'Section',
    label: 'Section',
    icon: 'Layout',
    defaultProps: {},
    defaultStyles: {
      display: 'block',
      width: '100%',
      paddingTop: '5%',
      paddingBottom: '5%',
    },
    propsDefinition: {},
  },
  Box: {
    type: 'Box',
    label: 'Box',
    icon: 'Square',
    defaultProps: {},
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '8px',
      backgroundColor: 'hsl(var(--muted))',
      borderRadius: '8px',
      minHeight: '100px',
    },
    propsDefinition: {},
  },
  Container: {
    type: 'Container',
    label: 'Container',
    icon: 'Container',
    defaultProps: {
      containerType: 'container',
      columnLayout: 'none',
    },
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '8px',
      minHeight: '100px',
    },
    propsDefinition: {
      containerType: {
        type: 'select',
        label: 'Container Type',
        control: 'select',
        options: ['container', 'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-xxl', 'container-fluid'],
        defaultValue: 'container',
      },
      columnLayout: {
        type: 'select',
        label: 'Column Layout',
        control: 'select',
        options: ['none', 'single', 'two-equal', 'three-equal', 'three-unequal', 'two-nested'],
        defaultValue: 'none',
      },
    },
  },
  Column: {
    type: 'Column',
    label: 'Column',
    icon: 'Columns',
    defaultProps: {
      columnWidth: 'auto',
    },
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px',
      minHeight: '50px',
    },
    propsDefinition: {
      columnWidth: {
        type: 'string',
        label: 'Width',
        control: 'text',
        defaultValue: 'auto',
      },
    },
  },
  Text: {
    type: 'Text',
    label: 'Text',
    icon: 'Type',
    defaultProps: {
      children: 'The text you can edit',
    },
    defaultStyles: {
      fontSize: '16px',
      lineHeight: '1.5',
      color: 'hsl(var(--foreground))',
    },
    propsDefinition: {
      children: {
        type: 'string',
        label: 'Content',
        control: 'textarea',
        defaultValue: 'Edit this text',
      },
    },
  },
  Heading: {
    type: 'Heading',
    label: 'Heading',
    icon: 'Heading',
    defaultProps: {
      level: 'h2',
      children: 'The future of AI-first hyper-personalized Websites.',
    },
    defaultStyles: {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
      color: 'hsl(var(--foreground))',
    },
    propsDefinition: {
      level: {
        type: 'select',
        label: 'Level',
        control: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        defaultValue: 'h2',
      },
      children: {
        type: 'string',
        label: 'Content',
        control: 'textarea',
        defaultValue: 'Heading',
      },
    },
  },
  Button: {
    type: 'Button',
    label: 'Button',
    icon: 'MousePointerClick',
    defaultProps: {
      children: 'Button style',
    },
    defaultStyles: {
      padding: '12px 24px',
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
    },
    propsDefinition: {
      children: {
        type: 'string',
        label: 'Text',
        control: 'text',
        defaultValue: 'Click me',
      },
    },
  },
  Image: {
    type: 'Image',
    label: 'Image',
    icon: 'Image',
    defaultProps: {
      src: 'https://via.placeholder.com/400x300',
      alt: 'Placeholder image',
    },
    defaultStyles: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
    propsDefinition: {
      src: {
        type: 'string',
        label: 'Source URL',
        control: 'text',
        defaultValue: 'https://via.placeholder.com/400x300',
      },
      alt: {
        type: 'string',
        label: 'Alt Text',
        control: 'text',
        defaultValue: 'Image description',
      },
    },
  },
  Link: {
    type: 'Link',
    label: 'Link',
    icon: 'Link',
    defaultProps: {
      href: '#',
      children: 'Link text',
    },
    defaultStyles: {
      color: 'hsl(var(--primary))',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    propsDefinition: {
      href: {
        type: 'string',
        label: 'URL',
        control: 'text',
        defaultValue: '#',
      },
      children: {
        type: 'string',
        label: 'Text',
        control: 'text',
        defaultValue: 'Link',
      },
    },
  },
};
