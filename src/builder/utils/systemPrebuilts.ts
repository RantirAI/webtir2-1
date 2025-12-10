import { ComponentInstance, ComponentType } from '../store/types';
import { generateId } from './instance';

export interface SystemPrebuiltDefinition {
  id: string;
  name: string;
  category: string;
  instance: ComponentInstance;
  defaultStyles: Record<string, Record<string, string>>; // styleSourceId -> property -> value
}

// Helper to create style entries
const createStyleEntry = (properties: Record<string, string>) => properties;

// ============================================================================
// SYSTEM PREBUILT DEFINITIONS
// ============================================================================

export const createSystemPrebuilts = (): SystemPrebuiltDefinition[] => {
  const prebuilts: SystemPrebuiltDefinition[] = [];

  // ---------------------------------------------------------------------------
  // HERO SECTION
  // ---------------------------------------------------------------------------
  const heroId = generateId();
  const heroContainerId = generateId();
  const heroHeadingId = generateId();
  const heroTextId = generateId();
  const heroButtonsId = generateId();
  const heroBtn1Id = generateId();
  const heroBtn2Id = generateId();

  prebuilts.push({
    id: 'system-hero-section',
    name: 'Hero Section',
    category: 'Sections',
    instance: {
      id: heroId,
      type: 'Section' as ComponentType,
      label: 'Section',
      props: {},
      styleSourceIds: ['style-hero-section'],
      children: [
        {
          id: heroContainerId,
          type: 'Container' as ComponentType,
          label: 'Container',
          props: {},
          styleSourceIds: ['style-hero-container'],
          children: [
            {
              id: heroHeadingId,
              type: 'Heading' as ComponentType,
              label: 'Heading',
              props: { level: 'h1', children: 'Build Something Amazing' },
              styleSourceIds: ['style-hero-heading'],
              children: [],
            },
            {
              id: heroTextId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Create beautiful, responsive websites with our visual builder. No coding required.' },
              styleSourceIds: ['style-hero-text'],
              children: [],
            },
            {
              id: heroButtonsId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-hero-buttons'],
              children: [
                {
                  id: heroBtn1Id,
                  type: 'Button' as ComponentType,
                  label: 'Button',
                  props: { children: 'Get Started' },
                  styleSourceIds: ['style-hero-btn-primary'],
                  children: [],
                },
                {
                  id: heroBtn2Id,
                  type: 'Button' as ComponentType,
                  label: 'Button',
                  props: { children: 'Learn More' },
                  styleSourceIds: ['style-hero-btn-secondary'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-hero-section': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        minHeight: '600px',
        backgroundColor: 'hsl(var(--background))',
      }),
      'style-hero-container': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '800px',
        gap: '24px',
      }),
      'style-hero-heading': createStyleEntry({
        fontSize: '56px',
        fontWeight: '700',
        lineHeight: '1.1',
        color: 'hsl(var(--foreground))',
      }),
      'style-hero-text': createStyleEntry({
        fontSize: '20px',
        lineHeight: '1.6',
        color: 'hsl(var(--muted-foreground))',
        maxWidth: '600px',
      }),
      'style-hero-buttons': createStyleEntry({
        display: 'flex',
        gap: '16px',
        marginTop: '16px',
      }),
      'style-hero-btn-primary': createStyleEntry({
        padding: '12px 32px',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
      }),
      'style-hero-btn-secondary': createStyleEntry({
        padding: '12px 32px',
        backgroundColor: 'transparent',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // FEATURE CARD
  // ---------------------------------------------------------------------------
  const cardId = generateId();
  const cardIconId = generateId();
  const cardHeadingId = generateId();
  const cardTextId = generateId();

  prebuilts.push({
    id: 'system-feature-card',
    name: 'Feature Card',
    category: 'Cards',
    instance: {
      id: cardId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-feature-card'],
      children: [
        {
          id: cardIconId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-card-icon'],
          children: [],
        },
        {
          id: cardHeadingId,
          type: 'Heading' as ComponentType,
          label: 'Heading',
          props: { level: 'h3', children: 'Feature Title' },
          styleSourceIds: ['style-card-heading'],
          children: [],
        },
        {
          id: cardTextId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Describe your feature here. Keep it short and focused on the benefit.' },
          styleSourceIds: ['style-card-text'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-feature-card': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '32px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
      }),
      'style-card-icon': createStyleEntry({
        width: '48px',
        height: '48px',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        borderRadius: '8px',
      }),
      'style-card-heading': createStyleEntry({
        fontSize: '20px',
        fontWeight: '600',
        lineHeight: '1.3',
        color: 'hsl(var(--foreground))',
      }),
      'style-card-text': createStyleEntry({
        fontSize: '16px',
        lineHeight: '1.6',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CTA SECTION
  // ---------------------------------------------------------------------------
  const ctaId = generateId();
  const ctaContainerId = generateId();
  const ctaHeadingId = generateId();
  const ctaTextId = generateId();
  const ctaButtonId = generateId();

  prebuilts.push({
    id: 'system-cta-section',
    name: 'CTA Section',
    category: 'Sections',
    instance: {
      id: ctaId,
      type: 'Section' as ComponentType,
      label: 'Section',
      props: {},
      styleSourceIds: ['style-cta-section'],
      children: [
        {
          id: ctaContainerId,
          type: 'Container' as ComponentType,
          label: 'Container',
          props: {},
          styleSourceIds: ['style-cta-container'],
          children: [
            {
              id: ctaHeadingId,
              type: 'Heading' as ComponentType,
              label: 'Heading',
              props: { level: 'h2', children: 'Ready to Get Started?' },
              styleSourceIds: ['style-cta-heading'],
              children: [],
            },
            {
              id: ctaTextId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Join thousands of users already building amazing websites.' },
              styleSourceIds: ['style-cta-text'],
              children: [],
            },
            {
              id: ctaButtonId,
              type: 'Button' as ComponentType,
              label: 'Button',
              props: { children: 'Start Free Trial' },
              styleSourceIds: ['style-cta-button'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-cta-section': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        backgroundColor: 'hsl(var(--primary))',
      }),
      'style-cta-container': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '600px',
        gap: '20px',
      }),
      'style-cta-heading': createStyleEntry({
        fontSize: '40px',
        fontWeight: '700',
        lineHeight: '1.2',
        color: 'hsl(var(--primary-foreground))',
      }),
      'style-cta-text': createStyleEntry({
        fontSize: '18px',
        lineHeight: '1.6',
        color: 'hsl(var(--primary-foreground) / 0.9)',
      }),
      'style-cta-button': createStyleEntry({
        padding: '14px 40px',
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
        marginTop: '8px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TESTIMONIAL CARD
  // ---------------------------------------------------------------------------
  const testimonialId = generateId();
  const testimonialQuoteId = generateId();
  const testimonialAuthorId = generateId();
  const testimonialNameId = generateId();
  const testimonialRoleId = generateId();

  prebuilts.push({
    id: 'system-testimonial-card',
    name: 'Testimonial Card',
    category: 'Cards',
    instance: {
      id: testimonialId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-testimonial-card'],
      children: [
        {
          id: testimonialQuoteId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: '"This product has completely transformed our workflow. Highly recommended!"' },
          styleSourceIds: ['style-testimonial-quote'],
          children: [],
        },
        {
          id: testimonialAuthorId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-testimonial-author'],
          children: [
            {
              id: testimonialNameId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'John Doe' },
              styleSourceIds: ['style-testimonial-name'],
              children: [],
            },
            {
              id: testimonialRoleId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'CEO at Company' },
              styleSourceIds: ['style-testimonial-role'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-testimonial-card': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
      }),
      'style-testimonial-quote': createStyleEntry({
        fontSize: '18px',
        lineHeight: '1.7',
        color: 'hsl(var(--foreground))',
        fontStyle: 'italic',
      }),
      'style-testimonial-author': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }),
      'style-testimonial-name': createStyleEntry({
        fontSize: '16px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-testimonial-role': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------------
  const footerId = generateId();
  const footerContainerId = generateId();
  const footerLogoId = generateId();
  const footerLinksId = generateId();
  const footerLink1Id = generateId();
  const footerLink2Id = generateId();
  const footerLink3Id = generateId();
  const footerCopyrightId = generateId();

  prebuilts.push({
    id: 'system-footer',
    name: 'Footer',
    category: 'Sections',
    instance: {
      id: footerId,
      type: 'Section' as ComponentType,
      label: 'Section',
      props: { htmlTag: 'footer' },
      styleSourceIds: ['style-footer-section'],
      children: [
        {
          id: footerContainerId,
          type: 'Container' as ComponentType,
          label: 'Container',
          props: {},
          styleSourceIds: ['style-footer-container'],
          children: [
            {
              id: footerLogoId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Your Brand' },
              styleSourceIds: ['style-footer-logo'],
              children: [],
            },
            {
              id: footerLinksId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-footer-links'],
              children: [
                {
                  id: footerLink1Id,
                  type: 'Link' as ComponentType,
                  label: 'Link',
                  props: { href: '#', children: 'Privacy' },
                  styleSourceIds: ['style-footer-link'],
                  children: [],
                },
                {
                  id: footerLink2Id,
                  type: 'Link' as ComponentType,
                  label: 'Link',
                  props: { href: '#', children: 'Terms' },
                  styleSourceIds: ['style-footer-link-2'],
                  children: [],
                },
                {
                  id: footerLink3Id,
                  type: 'Link' as ComponentType,
                  label: 'Link',
                  props: { href: '#', children: 'Contact' },
                  styleSourceIds: ['style-footer-link-3'],
                  children: [],
                },
              ],
            },
            {
              id: footerCopyrightId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: '© 2024 Your Company. All rights reserved.' },
              styleSourceIds: ['style-footer-copyright'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-footer-section': createStyleEntry({
        padding: '48px 24px',
        backgroundColor: 'hsl(var(--muted))',
        borderTop: '1px solid hsl(var(--border))',
      }),
      'style-footer-container': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }),
      'style-footer-logo': createStyleEntry({
        fontSize: '20px',
        fontWeight: '700',
        color: 'hsl(var(--foreground))',
      }),
      'style-footer-links': createStyleEntry({
        display: 'flex',
        gap: '32px',
      }),
      'style-footer-link': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-footer-link-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-footer-link-3': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-footer-copyright': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  return prebuilts;
};

// Get unique categories from system prebuilts
export const getSystemPrebuiltCategories = (prebuilts: SystemPrebuiltDefinition[]): string[] => {
  return [...new Set(prebuilts.map(p => p.category))];
};
