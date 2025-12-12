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

  // ---------------------------------------------------------------------------
  // PRICING CARD (shadcn Card style)
  // ---------------------------------------------------------------------------
  const pricingId = generateId();
  const pricingHeaderId = generateId();
  const pricingTitleId = generateId();
  const pricingPriceId = generateId();
  const pricingDescId = generateId();
  const pricingFeaturesId = generateId();
  const pricingFeature1Id = generateId();
  const pricingFeature2Id = generateId();
  const pricingFeature3Id = generateId();
  const pricingButtonId = generateId();

  prebuilts.push({
    id: 'system-pricing-card',
    name: 'Pricing Card',
    category: 'Cards',
    instance: {
      id: pricingId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-pricing-card'],
      children: [
        {
          id: pricingHeaderId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-pricing-header'],
          children: [
            {
              id: pricingTitleId,
              type: 'Heading' as ComponentType,
              label: 'Heading',
              props: { level: 'h3', children: 'Pro Plan' },
              styleSourceIds: ['style-pricing-title'],
              children: [],
            },
            {
              id: pricingPriceId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: '$29/month' },
              styleSourceIds: ['style-pricing-price'],
              children: [],
            },
            {
              id: pricingDescId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Perfect for growing teams' },
              styleSourceIds: ['style-pricing-desc'],
              children: [],
            },
          ],
        },
        {
          id: pricingFeaturesId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-pricing-features'],
          children: [
            {
              id: pricingFeature1Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: '✓ Unlimited projects' },
              styleSourceIds: ['style-pricing-feature'],
              children: [],
            },
            {
              id: pricingFeature2Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: '✓ Priority support' },
              styleSourceIds: ['style-pricing-feature-2'],
              children: [],
            },
            {
              id: pricingFeature3Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: '✓ Advanced analytics' },
              styleSourceIds: ['style-pricing-feature-3'],
              children: [],
            },
          ],
        },
        {
          id: pricingButtonId,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Get Started' },
          styleSourceIds: ['style-pricing-button'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-pricing-card': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.05)',
      }),
      'style-pricing-header': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }),
      'style-pricing-title': createStyleEntry({
        fontSize: '20px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-pricing-price': createStyleEntry({
        fontSize: '36px',
        fontWeight: '700',
        color: 'hsl(var(--foreground))',
      }),
      'style-pricing-desc': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-pricing-features': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 0',
        borderTop: '1px solid hsl(var(--border))',
        borderBottom: '1px solid hsl(var(--border))',
      }),
      'style-pricing-feature': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
      }),
      'style-pricing-feature-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
      }),
      'style-pricing-feature-3': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
      }),
      'style-pricing-button': createStyleEntry({
        width: '100%',
        padding: '12px 24px',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // ALERT/BANNER (shadcn Alert style)
  // ---------------------------------------------------------------------------
  const alertId = generateId();
  const alertIconId = generateId();
  const alertContentId = generateId();
  const alertTitleId = generateId();
  const alertDescId = generateId();

  prebuilts.push({
    id: 'system-alert-banner',
    name: 'Alert Banner',
    category: 'UI Components',
    instance: {
      id: alertId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-alert'],
      children: [
        {
          id: alertIconId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-alert-icon'],
          children: [],
        },
        {
          id: alertContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-alert-content'],
          children: [
            {
              id: alertTitleId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Heads up!' },
              styleSourceIds: ['style-alert-title'],
              children: [],
            },
            {
              id: alertDescId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'You can add components to your app using the CLI.' },
              styleSourceIds: ['style-alert-desc'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-alert': createStyleEntry({
        display: 'flex',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'hsl(var(--muted))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
      }),
      'style-alert-icon': createStyleEntry({
        width: '20px',
        height: '20px',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '50%',
        flexShrink: '0',
      }),
      'style-alert-content': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }),
      'style-alert-title': createStyleEntry({
        fontSize: '14px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-alert-desc': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        lineHeight: '1.5',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // AVATAR GROUP
  // ---------------------------------------------------------------------------
  const avatarGroupId = generateId();
  const avatar1Id = generateId();
  const avatar2Id = generateId();
  const avatar3Id = generateId();
  const avatarMoreId = generateId();

  prebuilts.push({
    id: 'system-avatar-group',
    name: 'Avatar Group',
    category: 'UI Components',
    instance: {
      id: avatarGroupId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-avatar-group'],
      children: [
        {
          id: avatar1Id,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-avatar'],
          children: [],
        },
        {
          id: avatar2Id,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-avatar-2'],
          children: [],
        },
        {
          id: avatar3Id,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-avatar-3'],
          children: [],
        },
        {
          id: avatarMoreId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-avatar-more'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-avatar-group': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
      }),
      'style-avatar': createStyleEntry({
        width: '40px',
        height: '40px',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '50%',
        border: '2px solid hsl(var(--background))',
        marginLeft: '0',
      }),
      'style-avatar-2': createStyleEntry({
        width: '40px',
        height: '40px',
        backgroundColor: 'hsl(var(--secondary))',
        borderRadius: '50%',
        border: '2px solid hsl(var(--background))',
        marginLeft: '-12px',
      }),
      'style-avatar-3': createStyleEntry({
        width: '40px',
        height: '40px',
        backgroundColor: 'hsl(var(--accent))',
        borderRadius: '50%',
        border: '2px solid hsl(var(--background))',
        marginLeft: '-12px',
      }),
      'style-avatar-more': createStyleEntry({
        width: '40px',
        height: '40px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '50%',
        border: '2px solid hsl(var(--background))',
        marginLeft: '-12px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // BADGE
  // ---------------------------------------------------------------------------
  const badgeId = generateId();
  const badgeTextId = generateId();

  prebuilts.push({
    id: 'system-badge',
    name: 'Badge',
    category: 'UI Components',
    instance: {
      id: badgeId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-badge'],
      children: [
        {
          id: badgeTextId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'New' },
          styleSourceIds: ['style-badge-text'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-badge': createStyleEntry({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '9999px',
      }),
      'style-badge-text': createStyleEntry({
        fontSize: '12px',
        fontWeight: '600',
        color: 'hsl(var(--primary-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // INPUT WITH LABEL (shadcn Input style)
  // ---------------------------------------------------------------------------
  const inputGroupId = generateId();
  const inputLabelId = generateId();
  const inputFieldId = generateId();

  prebuilts.push({
    id: 'system-input-field',
    name: 'Input Field',
    category: 'Form Elements',
    instance: {
      id: inputGroupId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-input-group'],
      children: [
        {
          id: inputLabelId,
          type: 'InputLabel' as ComponentType,
          label: 'InputLabel',
          props: { children: 'Email' },
          styleSourceIds: ['style-input-label'],
          children: [],
        },
        {
          id: inputFieldId,
          type: 'TextInput' as ComponentType,
          label: 'TextInput',
          props: { placeholder: 'Enter your email' },
          styleSourceIds: ['style-input-field'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-input-group': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
      }),
      'style-input-label': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-input-field': createStyleEntry({
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
        color: 'hsl(var(--foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TABS NAVIGATION
  // ---------------------------------------------------------------------------
  const tabsId = generateId();
  const tab1Id = generateId();
  const tab2Id = generateId();
  const tab3Id = generateId();

  prebuilts.push({
    id: 'system-tabs',
    name: 'Tabs Navigation',
    category: 'UI Components',
    instance: {
      id: tabsId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-tabs'],
      children: [
        {
          id: tab1Id,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Account' },
          styleSourceIds: ['style-tab-active'],
          children: [],
        },
        {
          id: tab2Id,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Password' },
          styleSourceIds: ['style-tab'],
          children: [],
        },
        {
          id: tab3Id,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Settings' },
          styleSourceIds: ['style-tab-2'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-tabs': createStyleEntry({
        display: 'inline-flex',
        backgroundColor: 'hsl(var(--muted))',
        padding: '4px',
        borderRadius: '8px',
        gap: '4px',
      }),
      'style-tab-active': createStyleEntry({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 1px 2px hsl(var(--foreground) / 0.05)',
      }),
      'style-tab': createStyleEntry({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: 'transparent',
        color: 'hsl(var(--muted-foreground))',
        borderRadius: '6px',
        border: 'none',
      }),
      'style-tab-2': createStyleEntry({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: 'transparent',
        color: 'hsl(var(--muted-foreground))',
        borderRadius: '6px',
        border: 'none',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // PROGRESS BAR
  // ---------------------------------------------------------------------------
  const progressId = generateId();
  const progressBarId = generateId();
  const progressFillId = generateId();

  prebuilts.push({
    id: 'system-progress',
    name: 'Progress Bar',
    category: 'UI Components',
    instance: {
      id: progressId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-progress-wrapper'],
      children: [
        {
          id: progressBarId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-progress-bar'],
          children: [
            {
              id: progressFillId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-progress-fill'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-progress-wrapper': createStyleEntry({
        width: '100%',
      }),
      'style-progress-bar': createStyleEntry({
        width: '100%',
        height: '8px',
        backgroundColor: 'hsl(var(--secondary))',
        borderRadius: '9999px',
        overflow: 'hidden',
      }),
      'style-progress-fill': createStyleEntry({
        width: '60%',
        height: '100%',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '9999px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // SEPARATOR
  // ---------------------------------------------------------------------------
  const separatorId = generateId();

  prebuilts.push({
    id: 'system-separator',
    name: 'Separator',
    category: 'UI Components',
    instance: {
      id: separatorId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-separator'],
      children: [],
    },
    defaultStyles: {
      'style-separator': createStyleEntry({
        width: '100%',
        height: '1px',
        backgroundColor: 'hsl(var(--border))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // SKELETON LOADER
  // ---------------------------------------------------------------------------
  const skeletonId = generateId();
  const skeletonAvatarId = generateId();
  const skeletonContentId = generateId();
  const skeletonLine1Id = generateId();
  const skeletonLine2Id = generateId();

  prebuilts.push({
    id: 'system-skeleton',
    name: 'Skeleton Loader',
    category: 'UI Components',
    instance: {
      id: skeletonId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-skeleton'],
      children: [
        {
          id: skeletonAvatarId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-skeleton-avatar'],
          children: [],
        },
        {
          id: skeletonContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-skeleton-content'],
          children: [
            {
              id: skeletonLine1Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-skeleton-line'],
              children: [],
            },
            {
              id: skeletonLine2Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-skeleton-line-short'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-skeleton': createStyleEntry({
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }),
      'style-skeleton-avatar': createStyleEntry({
        width: '48px',
        height: '48px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '50%',
      }),
      'style-skeleton-content': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1',
      }),
      'style-skeleton-line': createStyleEntry({
        width: '100%',
        height: '16px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '4px',
      }),
      'style-skeleton-line-short': createStyleEntry({
        width: '60%',
        height: '16px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '4px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // SWITCH/TOGGLE ROW
  // ---------------------------------------------------------------------------
  const switchRowId = generateId();
  const switchLabelId = generateId();
  const switchDescId = generateId();
  const switchToggleId = generateId();
  const switchTrackId = generateId();
  const switchThumbId = generateId();

  prebuilts.push({
    id: 'system-switch-row',
    name: 'Switch Row',
    category: 'Form Elements',
    instance: {
      id: switchRowId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-switch-row'],
      children: [
        {
          id: switchLabelId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-switch-label-wrapper'],
          children: [
            {
              id: switchDescId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Airplane Mode' },
              styleSourceIds: ['style-switch-label'],
              children: [],
            },
          ],
        },
        {
          id: switchToggleId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-switch-toggle'],
          children: [
            {
              id: switchTrackId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-switch-track'],
              children: [
                {
                  id: switchThumbId,
                  type: 'Div' as ComponentType,
                  label: 'Div',
                  props: {},
                  styleSourceIds: ['style-switch-thumb'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-switch-row': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
      }),
      'style-switch-label-wrapper': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
      }),
      'style-switch-label': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-switch-toggle': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
      }),
      'style-switch-track': createStyleEntry({
        width: '44px',
        height: '24px',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '9999px',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }),
      'style-switch-thumb': createStyleEntry({
        width: '20px',
        height: '20px',
        backgroundColor: 'hsl(var(--background))',
        borderRadius: '50%',
        boxShadow: '0 1px 2px hsl(var(--foreground) / 0.1)',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // LOGIN FORM
  // ---------------------------------------------------------------------------
  const loginId = generateId();
  const loginHeadingId = generateId();
  const loginDescId = generateId();
  const loginEmailGroupId = generateId();
  const loginEmailLabelId = generateId();
  const loginEmailInputId = generateId();
  const loginPasswordGroupId = generateId();
  const loginPasswordLabelId = generateId();
  const loginPasswordInputId = generateId();
  const loginButtonId = generateId();

  prebuilts.push({
    id: 'system-login-form',
    name: 'Login Form',
    category: 'Form Elements',
    instance: {
      id: loginId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-login-form'],
      children: [
        {
          id: loginHeadingId,
          type: 'Heading' as ComponentType,
          label: 'Heading',
          props: { level: 'h2', children: 'Sign in' },
          styleSourceIds: ['style-login-heading'],
          children: [],
        },
        {
          id: loginDescId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Enter your credentials to access your account' },
          styleSourceIds: ['style-login-desc'],
          children: [],
        },
        {
          id: loginEmailGroupId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-login-field'],
          children: [
            {
              id: loginEmailLabelId,
              type: 'InputLabel' as ComponentType,
              label: 'InputLabel',
              props: { children: 'Email' },
              styleSourceIds: ['style-login-label'],
              children: [],
            },
            {
              id: loginEmailInputId,
              type: 'TextInput' as ComponentType,
              label: 'TextInput',
              props: { placeholder: 'name@example.com', type: 'email' },
              styleSourceIds: ['style-login-input'],
              children: [],
            },
          ],
        },
        {
          id: loginPasswordGroupId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-login-field-2'],
          children: [
            {
              id: loginPasswordLabelId,
              type: 'InputLabel' as ComponentType,
              label: 'InputLabel',
              props: { children: 'Password' },
              styleSourceIds: ['style-login-label-2'],
              children: [],
            },
            {
              id: loginPasswordInputId,
              type: 'TextInput' as ComponentType,
              label: 'TextInput',
              props: { placeholder: '••••••••', type: 'password' },
              styleSourceIds: ['style-login-input-2'],
              children: [],
            },
          ],
        },
        {
          id: loginButtonId,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Sign in' },
          styleSourceIds: ['style-login-button'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-login-form': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        maxWidth: '400px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
      }),
      'style-login-heading': createStyleEntry({
        fontSize: '24px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-login-desc': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        marginTop: '-16px',
      }),
      'style-login-field': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }),
      'style-login-field-2': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }),
      'style-login-label': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-login-label-2': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-login-input': createStyleEntry({
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
        color: 'hsl(var(--foreground))',
      }),
      'style-login-input-2': createStyleEntry({
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
        color: 'hsl(var(--foreground))',
      }),
      'style-login-button': createStyleEntry({
        width: '100%',
        padding: '12px 24px',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '8px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // STATS CARD
  // ---------------------------------------------------------------------------
  const statsCardId = generateId();
  const statsLabelId = generateId();
  const statsValueId = generateId();
  const statsTrendId = generateId();

  prebuilts.push({
    id: 'system-stats-card',
    name: 'Stats Card',
    category: 'Cards',
    instance: {
      id: statsCardId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-stats-card'],
      children: [
        {
          id: statsLabelId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Total Revenue' },
          styleSourceIds: ['style-stats-label'],
          children: [],
        },
        {
          id: statsValueId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: '$45,231.89' },
          styleSourceIds: ['style-stats-value'],
          children: [],
        },
        {
          id: statsTrendId,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: '+20.1% from last month' },
          styleSourceIds: ['style-stats-trend'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-stats-card': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '24px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
      }),
      'style-stats-label': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-stats-value': createStyleEntry({
        fontSize: '32px',
        fontWeight: '700',
        color: 'hsl(var(--foreground))',
      }),
      'style-stats-trend': createStyleEntry({
        fontSize: '12px',
        color: 'hsl(142.1 76.2% 36.3%)',
      }),
    },
  });

  return prebuilts;
};

// Get unique categories from system prebuilts
export const getSystemPrebuiltCategories = (prebuilts: SystemPrebuiltDefinition[]): string[] => {
  return [...new Set(prebuilts.map(p => p.category))];
};
