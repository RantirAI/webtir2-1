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
      type: 'Switch' as ComponentType,
      label: 'Switch',
      props: {
        label: 'Airplane Mode',
        checked: true,
        disabled: false,
      },
      styleSourceIds: ['style-switch-row'],
      children: [],
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
        color: 'hsl(142 76% 36%)',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // ACCORDION ITEM
  // ---------------------------------------------------------------------------
  const accordionId = generateId();
  const accordionHeaderId = generateId();
  const accordionTitleId = generateId();
  const accordionIconId = generateId();
  const accordionContentId = generateId();

  prebuilts.push({
    id: 'system-accordion',
    name: 'Accordion',
    category: 'Interactive',
    instance: {
      id: accordionId,
      type: 'Accordion' as ComponentType,
      label: 'Accordion',
      props: {
        items: [
          { id: '1', title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.', defaultOpen: true },
          { id: '2', title: 'Is it styled?', content: 'Yes. It comes with default styles that match your design system.' },
          { id: '3', title: 'Is it animated?', content: 'Yes. It supports smooth animations for expanding and collapsing.' },
        ]
      },
      styleSourceIds: ['style-accordion'],
      children: [],
    },
    defaultStyles: {
      'style-accordion': createStyleEntry({
        width: '100%',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // ALERT DIALOG
  // ---------------------------------------------------------------------------
  const alertDialogId = generateId();
  const alertDialogOverlayId = generateId();
  const alertDialogContentId = generateId();
  const alertDialogTitleId = generateId();
  const alertDialogDescId = generateId();
  const alertDialogActionsId = generateId();
  const alertDialogCancelId = generateId();
  const alertDialogConfirmId = generateId();

  prebuilts.push({
    id: 'system-alert-dialog',
    name: 'Alert Dialog',
    category: 'Interactive',
    instance: {
      id: alertDialogId,
      type: 'AlertDialog' as ComponentType,
      label: 'AlertDialog',
      props: {
        triggerText: 'Open Dialog',
        title: 'Are you sure?',
        description: 'This action cannot be undone. This will permanently delete your account.',
        cancelText: 'Cancel',
        actionText: 'Continue',
        actionVariant: 'destructive'
      },
      styleSourceIds: ['style-alert-dialog'],
      children: [],
    },
    defaultStyles: {
      'style-alert-dialog': createStyleEntry({
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
      }),
      'style-dialog-overlay': createStyleEntry({
        position: 'absolute',
        inset: '0',
        backgroundColor: 'hsl(var(--foreground) / 0.8)',
        borderRadius: '12px',
      }),
      'style-dialog-content': createStyleEntry({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px hsl(var(--foreground) / 0.25)',
      }),
      'style-dialog-title': createStyleEntry({
        fontSize: '18px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-dialog-desc': createStyleEntry({
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-dialog-actions': createStyleEntry({
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        marginTop: '8px',
      }),
      'style-dialog-cancel': createStyleEntry({
        padding: '10px 16px',
        backgroundColor: 'transparent',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
      }),
      'style-dialog-confirm': createStyleEntry({
        padding: '10px 16px',
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // AVATAR
  // ---------------------------------------------------------------------------
  const avatarId = generateId();
  const avatarImageId = generateId();

  prebuilts.push({
    id: 'system-avatar',
    name: 'Avatar',
    category: 'Data Display',
    instance: {
      id: avatarId,
      type: 'Avatar' as ComponentType,
      label: 'Avatar',
      props: {
        src: '',
        fallback: 'JD',
        alt: 'User avatar',
        size: 'md',
      },
      styleSourceIds: ['style-avatar-single'],
      children: [],
    },
    defaultStyles: {
      'style-avatar-single': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '50%',
        overflow: 'hidden',
      }),
      'style-avatar-fallback': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--muted-foreground))',
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
    category: 'Data Display',
    instance: {
      id: badgeId,
      type: 'Badge' as ComponentType,
      label: 'Badge',
      props: {
        text: 'New',
        variant: 'default',
      },
      styleSourceIds: ['style-badge'],
      children: [],
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
  // BREADCRUMB
  // ---------------------------------------------------------------------------
  const breadcrumbId = generateId();
  const breadcrumb1Id = generateId();
  const breadcrumbSep1Id = generateId();
  const breadcrumb2Id = generateId();
  const breadcrumbSep2Id = generateId();
  const breadcrumb3Id = generateId();

  prebuilts.push({
    id: 'system-breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    instance: {
      id: breadcrumbId,
      type: 'Breadcrumb' as ComponentType,
      label: 'Breadcrumb',
      props: {
        items: [
          { id: '1', label: 'Home', href: '/' },
          { id: '2', label: 'Products', href: '/products' },
          { id: '3', label: 'Current Page', href: '' },
        ],
        separator: '/',
      },
      styleSourceIds: ['style-breadcrumb'],
      children: [],
    },
    defaultStyles: {
      'style-breadcrumb': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }),
      'style-breadcrumb-link': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-breadcrumb-link-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-breadcrumb-sep': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-breadcrumb-sep-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-breadcrumb-current': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CALENDAR
  // ---------------------------------------------------------------------------
  const calendarId = generateId();
  const calendarHeaderId = generateId();
  const calendarNavId = generateId();
  const calendarPrevId = generateId();
  const calendarMonthId = generateId();
  const calendarNextId = generateId();
  const calendarGridId = generateId();

  prebuilts.push({
    id: 'system-calendar',
    name: 'Calendar',
    category: 'Form Elements',
    instance: {
      id: calendarId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-calendar'],
      children: [
        {
          id: calendarHeaderId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-calendar-header'],
          children: [
            {
              id: calendarNavId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-calendar-nav'],
              children: [
                {
                  id: calendarPrevId,
                  type: 'Button' as ComponentType,
                  label: 'Button',
                  props: { children: '‹' },
                  styleSourceIds: ['style-calendar-nav-btn'],
                  children: [],
                },
                {
                  id: calendarMonthId,
                  type: 'Text' as ComponentType,
                  label: 'Text',
                  props: { children: 'December 2024' },
                  styleSourceIds: ['style-calendar-month'],
                  children: [],
                },
                {
                  id: calendarNextId,
                  type: 'Button' as ComponentType,
                  label: 'Button',
                  props: { children: '›' },
                  styleSourceIds: ['style-calendar-nav-btn-2'],
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: calendarGridId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-calendar-grid'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-calendar': createStyleEntry({
        padding: '16px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
        width: '280px',
      }),
      'style-calendar-header': createStyleEntry({
        marginBottom: '16px',
      }),
      'style-calendar-nav': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }),
      'style-calendar-nav-btn': createStyleEntry({
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        fontSize: '18px',
        color: 'hsl(var(--muted-foreground))',
        cursor: 'pointer',
      }),
      'style-calendar-nav-btn-2': createStyleEntry({
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        fontSize: '18px',
        color: 'hsl(var(--muted-foreground))',
        cursor: 'pointer',
      }),
      'style-calendar-month': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-calendar-grid': createStyleEntry({
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CAROUSEL
  // ---------------------------------------------------------------------------
  const carouselId = generateId();
  const carouselTrackId = generateId();
  const carouselSlide1Id = generateId();
  const carouselSlide2Id = generateId();
  const carouselSlide3Id = generateId();
  const carouselDotsId = generateId();

  prebuilts.push({
    id: 'system-carousel',
    name: 'Carousel',
    category: 'Interactive',
    instance: {
      id: carouselId,
      type: 'Carousel' as ComponentType,
      label: 'Carousel',
      props: {
        slides: [
          { id: '1', imageUrl: '', title: 'Slide 1', description: 'First slide content' },
          { id: '2', imageUrl: '', title: 'Slide 2', description: 'Second slide content' },
          { id: '3', imageUrl: '', title: 'Slide 3', description: 'Third slide content' },
        ],
        autoPlay: false,
        loop: true,
        showArrows: true,
        showDots: true,
      },
      styleSourceIds: ['style-carousel'],
      children: [],
    },
    defaultStyles: {
      'style-carousel': createStyleEntry({
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
      }),
      'style-carousel-track': createStyleEntry({
        display: 'flex',
        gap: '16px',
      }),
      'style-carousel-slide': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        height: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
      }),
      'style-carousel-slide-2': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        height: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
      }),
      'style-carousel-slide-3': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        height: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
      }),
      'style-carousel-dots': createStyleEntry({
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // COMMAND PALETTE
  // ---------------------------------------------------------------------------
  const commandId = generateId();
  const commandInputId = generateId();
  const commandListId = generateId();
  const commandItem1Id = generateId();
  const commandItem2Id = generateId();
  const commandItem3Id = generateId();

  prebuilts.push({
    id: 'system-command',
    name: 'Command Palette',
    category: 'Interactive',
    instance: {
      id: commandId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-command'],
      children: [
        {
          id: commandInputId,
          type: 'TextInput' as ComponentType,
          label: 'TextInput',
          props: { placeholder: 'Type a command or search...' },
          styleSourceIds: ['style-command-input'],
          children: [],
        },
        {
          id: commandListId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-command-list'],
          children: [
            {
              id: commandItem1Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-command-item'],
              children: [],
            },
            {
              id: commandItem2Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-command-item-2'],
              children: [],
            },
            {
              id: commandItem3Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-command-item-3'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-command': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px hsl(var(--foreground) / 0.1)',
        maxWidth: '400px',
      }),
      'style-command-input': createStyleEntry({
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
        outline: 'none',
      }),
      'style-command-list': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        maxHeight: '300px',
        overflowY: 'auto',
      }),
      'style-command-item': createStyleEntry({
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        cursor: 'pointer',
      }),
      'style-command-item-2': createStyleEntry({
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
      'style-command-item-3': createStyleEntry({
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CONTEXT MENU (Visual representation)
  // ---------------------------------------------------------------------------
  const contextMenuId = generateId();
  const contextMenuItem1Id = generateId();
  const contextMenuItem2Id = generateId();
  const contextMenuSepId = generateId();
  const contextMenuItem3Id = generateId();

  prebuilts.push({
    id: 'system-context-menu',
    name: 'Context Menu',
    category: 'Interactive',
    instance: {
      id: contextMenuId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-context-menu'],
      children: [
        {
          id: contextMenuItem1Id,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Edit' },
          styleSourceIds: ['style-context-item'],
          children: [],
        },
        {
          id: contextMenuItem2Id,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Duplicate' },
          styleSourceIds: ['style-context-item-2'],
          children: [],
        },
        {
          id: contextMenuSepId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-context-sep'],
          children: [],
        },
        {
          id: contextMenuItem3Id,
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Delete' },
          styleSourceIds: ['style-context-item-delete'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-context-menu': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
        minWidth: '160px',
      }),
      'style-context-item': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-context-item-2': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-context-sep': createStyleEntry({
        height: '1px',
        backgroundColor: 'hsl(var(--border))',
        margin: '4px 0',
      }),
      'style-context-item-delete': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--destructive))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // DRAWER
  // ---------------------------------------------------------------------------
  const drawerId = generateId();
  const drawerHandleId = generateId();
  const drawerContentId = generateId();
  const drawerTitleId = generateId();
  const drawerDescId = generateId();

  prebuilts.push({
    id: 'system-drawer',
    name: 'Drawer',
    category: 'Interactive',
    instance: {
      id: drawerId,
      type: 'Drawer' as ComponentType,
      label: 'Drawer',
      props: {
        triggerText: 'Open Drawer',
        title: 'Drawer Title',
        description: 'This is a bottom drawer component.',
        position: 'bottom',
      },
      styleSourceIds: ['style-drawer'],
      children: [],
    },
    defaultStyles: {
      'style-drawer': createStyleEntry({
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '16px 16px 0 0',
        padding: '16px',
        boxShadow: '0 -4px 24px hsl(var(--foreground) / 0.1)',
      }),
      'style-drawer-handle': createStyleEntry({
        width: '48px',
        height: '4px',
        backgroundColor: 'hsl(var(--muted-foreground))',
        borderRadius: '2px',
        margin: '0 auto 16px',
      }),
      'style-drawer-content': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
      }),
      'style-drawer-title': createStyleEntry({
        fontSize: '18px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-drawer-desc': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // DROPDOWN MENU
  // ---------------------------------------------------------------------------
  const dropdownMenuId = generateId();
  const dropdownTriggerId = generateId();
  const dropdownContentId = generateId();
  const dropdownItem1Id = generateId();
  const dropdownItem2Id = generateId();
  const dropdownItem3Id = generateId();

  prebuilts.push({
    id: 'system-dropdown-menu',
    name: 'Dropdown Menu',
    category: 'Interactive',
    instance: {
      id: dropdownMenuId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-dropdown-menu'],
      children: [
        {
          id: dropdownTriggerId,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: 'Open Menu' },
          styleSourceIds: ['style-dropdown-trigger'],
          children: [],
        },
        {
          id: dropdownContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-dropdown-content'],
          children: [
            {
              id: dropdownItem1Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Profile' },
              styleSourceIds: ['style-dropdown-item'],
              children: [],
            },
            {
              id: dropdownItem2Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Settings' },
              styleSourceIds: ['style-dropdown-item-2'],
              children: [],
            },
            {
              id: dropdownItem3Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Log out' },
              styleSourceIds: ['style-dropdown-item-3'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-dropdown-menu': createStyleEntry({
        position: 'relative',
        display: 'inline-block',
      }),
      'style-dropdown-trigger': createStyleEntry({
        padding: '10px 16px',
        backgroundColor: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
      }),
      'style-dropdown-content': createStyleEntry({
        position: 'absolute',
        top: '100%',
        left: '0',
        marginTop: '4px',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
        minWidth: '160px',
      }),
      'style-dropdown-item': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-dropdown-item-2': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-dropdown-item-3': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // HOVER CARD
  // ---------------------------------------------------------------------------
  const hoverCardId = generateId();
  const hoverTrigId = generateId();
  const hoverContentId = generateId();
  const hoverAvatarId = generateId();
  const hoverInfoId = generateId();
  const hoverNameId = generateId();
  const hoverDescId = generateId();

  prebuilts.push({
    id: 'system-hover-card',
    name: 'Hover Card',
    category: 'Interactive',
    instance: {
      id: hoverCardId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-hover-card'],
      children: [
        {
          id: hoverTrigId,
          type: 'Link' as ComponentType,
          label: 'Link',
          props: { href: '#', children: '@username' },
          styleSourceIds: ['style-hover-trigger'],
          children: [],
        },
        {
          id: hoverContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-hover-content'],
          children: [
            {
              id: hoverAvatarId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-hover-avatar'],
              children: [],
            },
            {
              id: hoverInfoId,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-hover-info'],
              children: [
                {
                  id: hoverNameId,
                  type: 'Text' as ComponentType,
                  label: 'Text',
                  props: { children: 'John Doe' },
                  styleSourceIds: ['style-hover-name'],
                  children: [],
                },
                {
                  id: hoverDescId,
                  type: 'Text' as ComponentType,
                  label: 'Text',
                  props: { children: 'Software developer and open source contributor.' },
                  styleSourceIds: ['style-hover-desc'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-hover-card': createStyleEntry({
        position: 'relative',
        display: 'inline-block',
      }),
      'style-hover-trigger': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--primary))',
        textDecoration: 'underline',
      }),
      'style-hover-content': createStyleEntry({
        position: 'absolute',
        top: '100%',
        left: '0',
        marginTop: '8px',
        display: 'flex',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
        width: '280px',
      }),
      'style-hover-avatar': createStyleEntry({
        width: '48px',
        height: '48px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '50%',
        flexShrink: '0',
      }),
      'style-hover-info': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }),
      'style-hover-name': createStyleEntry({
        fontSize: '14px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-hover-desc': createStyleEntry({
        fontSize: '13px',
        lineHeight: '1.5',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // INPUT OTP
  // ---------------------------------------------------------------------------
  const otpId = generateId();
  const otp1Id = generateId();
  const otp2Id = generateId();
  const otp3Id = generateId();
  const otpSepId = generateId();
  const otp4Id = generateId();
  const otp5Id = generateId();
  const otp6Id = generateId();

  prebuilts.push({
    id: 'system-input-otp',
    name: 'OTP Input',
    category: 'Form Elements',
    instance: {
      id: otpId,
      type: 'OTPInput' as ComponentType,
      label: 'OTPInput',
      props: {
        length: 6,
        separator: true,
        separatorPosition: 3,
      },
      styleSourceIds: ['style-otp'],
      children: [],
    },
    defaultStyles: {
      'style-otp': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }),
      'style-otp-slot': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
      'style-otp-slot-2': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
      'style-otp-slot-3': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
      'style-otp-sep': createStyleEntry({
        fontSize: '20px',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-otp-slot-4': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
      'style-otp-slot-5': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
      'style-otp-slot-6': createStyleEntry({
        width: '40px',
        height: '48px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------------------------
  const paginationId = generateId();
  const pagePrevId = generateId();
  const page1Id = generateId();
  const page2Id = generateId();
  const page3Id = generateId();
  const pageNextId = generateId();

  prebuilts.push({
    id: 'system-pagination',
    name: 'Pagination',
    category: 'Navigation',
    instance: {
      id: paginationId,
      type: 'Pagination' as ComponentType,
      label: 'Pagination',
      props: {
        totalPages: 10,
        currentPage: 1,
        showPrevNext: true,
        maxVisible: 5,
      },
      styleSourceIds: ['style-pagination'],
      children: [],
    },
    defaultStyles: {
      'style-pagination': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }),
      'style-page-btn': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
      'style-page-btn-active': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(var(--primary))',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--primary-foreground))',
        cursor: 'pointer',
      }),
      'style-page-btn-2': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
      'style-page-btn-3': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
      'style-page-btn-4': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // POPOVER
  // ---------------------------------------------------------------------------
  const popoverId = generateId();
  const popoverTriggerId = generateId();
  const popoverContentId = generateId();
  const popoverTitleId = generateId();
  const popoverDescId = generateId();

  prebuilts.push({
    id: 'system-popover',
    name: 'Popover',
    category: 'Interactive',
    instance: {
      id: popoverId,
      type: 'Popover' as ComponentType,
      label: 'Popover',
      props: {
        triggerText: 'Open',
        title: 'Dimensions',
        content: 'Set the dimensions for the layer.',
      },
      styleSourceIds: ['style-popover'],
      children: [],
    },
    defaultStyles: {
      'style-popover': createStyleEntry({
        position: 'relative',
        display: 'inline-block',
      }),
      'style-popover-trigger': createStyleEntry({
        padding: '10px 16px',
        backgroundColor: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
      }),
      'style-popover-content': createStyleEntry({
        position: 'absolute',
        top: '100%',
        left: '0',
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
        width: '200px',
      }),
      'style-popover-title': createStyleEntry({
        fontSize: '14px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-popover-desc': createStyleEntry({
        fontSize: '13px',
        color: 'hsl(var(--muted-foreground))',
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
    category: 'Data Display',
    instance: {
      id: progressId,
      type: 'Progress' as ComponentType,
      label: 'Progress',
      props: {
        value: 60,
        max: 100,
        showLabel: false,
      },
      styleSourceIds: ['style-progress-wrapper'],
      children: [],
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
  // RADIO GROUP
  // ---------------------------------------------------------------------------
  const radioGroupId = generateId();
  const radioOption1Id = generateId();
  const radioCircle1Id = generateId();
  const radioLabel1Id = generateId();
  const radioOption2Id = generateId();
  const radioCircle2Id = generateId();
  const radioLabel2Id = generateId();

  prebuilts.push({
    id: 'system-radio-group',
    name: 'Radio Group',
    category: 'Form Elements',
    instance: {
      id: radioGroupId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-radio-group'],
      children: [
        {
          id: radioOption1Id,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-radio-option'],
          children: [
            {
              id: radioCircle1Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-radio-circle-selected'],
              children: [],
            },
            {
              id: radioLabel1Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Option A' },
              styleSourceIds: ['style-radio-label'],
              children: [],
            },
          ],
        },
        {
          id: radioOption2Id,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-radio-option-2'],
          children: [
            {
              id: radioCircle2Id,
              type: 'Div' as ComponentType,
              label: 'Div',
              props: {},
              styleSourceIds: ['style-radio-circle'],
              children: [],
            },
            {
              id: radioLabel2Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Option B' },
              styleSourceIds: ['style-radio-label-2'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-radio-group': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }),
      'style-radio-option': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
      }),
      'style-radio-option-2': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
      }),
      'style-radio-circle-selected': createStyleEntry({
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '4px solid hsl(var(--primary))',
        backgroundColor: 'hsl(var(--background))',
      }),
      'style-radio-circle': createStyleEntry({
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '1px solid hsl(var(--input))',
        backgroundColor: 'hsl(var(--background))',
      }),
      'style-radio-label': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
      }),
      'style-radio-label-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
      }),
    },
  });


  // ---------------------------------------------------------------------------
  // SELECT
  // ---------------------------------------------------------------------------
  const selectId = generateId();
  const selectTriggerId = generateId();
  const selectContentId = generateId();
  const selectItem1Id = generateId();
  const selectItem2Id = generateId();
  const selectItem3Id = generateId();

  prebuilts.push({
    id: 'system-select',
    name: 'Select',
    category: 'Form Elements',
    instance: {
      id: selectId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-select'],
      children: [
        {
          id: selectTriggerId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-select-trigger'],
          children: [],
        },
        {
          id: selectContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-select-content'],
          children: [
            {
              id: selectItem1Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Option 1' },
              styleSourceIds: ['style-select-item'],
              children: [],
            },
            {
              id: selectItem2Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Option 2' },
              styleSourceIds: ['style-select-item-2'],
              children: [],
            },
            {
              id: selectItem3Id,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Option 3' },
              styleSourceIds: ['style-select-item-3'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-select': createStyleEntry({
        position: 'relative',
        width: '200px',
      }),
      'style-select-trigger': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
        cursor: 'pointer',
      }),
      'style-select-content': createStyleEntry({
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        marginTop: '4px',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        backgroundColor: 'hsl(var(--popover))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
      }),
      'style-select-item': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-select-item-2': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-select-item-3': createStyleEntry({
        padding: '8px 12px',
        fontSize: '14px',
        color: 'hsl(var(--foreground))',
        borderRadius: '4px',
        cursor: 'pointer',
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
    category: 'Layout',
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
  // SHEET
  // ---------------------------------------------------------------------------
  const sheetId = generateId();
  const sheetOverlayId = generateId();
  const sheetContentId = generateId();
  const sheetTitleId = generateId();
  const sheetDescId = generateId();

  prebuilts.push({
    id: 'system-sheet',
    name: 'Sheet',
    category: 'Interactive',
    instance: {
      id: sheetId,
      type: 'Sheet' as ComponentType,
      label: 'Sheet',
      props: {
        triggerText: 'Open Sheet',
        title: 'Sheet Title',
        description: 'Make changes to your settings here.',
        side: 'right',
      },
      styleSourceIds: ['style-sheet'],
      children: [],
    },
    defaultStyles: {
      'style-sheet': createStyleEntry({
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        height: '300px',
      }),
      'style-sheet-overlay': createStyleEntry({
        position: 'absolute',
        inset: '0',
        backgroundColor: 'hsl(var(--foreground) / 0.3)',
      }),
      'style-sheet-content': createStyleEntry({
        position: 'absolute',
        right: '0',
        top: '0',
        bottom: '0',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        backgroundColor: 'hsl(var(--background))',
        borderLeft: '1px solid hsl(var(--border))',
      }),
      'style-sheet-title': createStyleEntry({
        fontSize: '18px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-sheet-desc': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
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
    category: 'Data Display',
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
  // SLIDER
  // ---------------------------------------------------------------------------
  const sliderId = generateId();
  const sliderTrackId = generateId();
  const sliderFillId = generateId();
  const sliderThumbId = generateId();

  prebuilts.push({
    id: 'system-slider',
    name: 'Slider',
    category: 'Form Elements',
    instance: {
      id: sliderId,
      type: 'Slider' as ComponentType,
      label: 'Slider',
      props: {
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 50,
        showValue: false,
      },
      styleSourceIds: ['style-slider'],
      children: [],
    },
    defaultStyles: {
      'style-slider': createStyleEntry({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '200px',
        height: '20px',
      }),
      'style-slider-track': createStyleEntry({
        position: 'relative',
        width: '100%',
        height: '4px',
        backgroundColor: 'hsl(var(--secondary))',
        borderRadius: '9999px',
      }),
      'style-slider-fill': createStyleEntry({
        position: 'absolute',
        left: '0',
        top: '0',
        height: '100%',
        width: '50%',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '9999px',
      }),
      'style-slider-thumb': createStyleEntry({
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '16px',
        height: '16px',
        backgroundColor: 'hsl(var(--background))',
        border: '2px solid hsl(var(--primary))',
        borderRadius: '50%',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TABLE
  // ---------------------------------------------------------------------------
  const tableId = generateId();
  const tableHeaderId = generateId();
  const tableHeaderRow = generateId();
  const tableH1Id = generateId();
  const tableH2Id = generateId();
  const tableH3Id = generateId();
  const tableBodyId = generateId();
  const tableRow1Id = generateId();
  const tableD1Id = generateId();
  const tableD2Id = generateId();
  const tableD3Id = generateId();

  prebuilts.push({
    id: 'system-table',
    name: 'Table',
    category: 'Data Display',
    instance: {
      id: tableId,
      type: 'Table' as ComponentType,
      label: 'Table',
      props: {
        columns: [
          { id: 'name', header: 'Name', accessor: 'name' },
          { id: 'status', header: 'Status', accessor: 'status' },
          { id: 'amount', header: 'Amount', accessor: 'amount' },
        ],
        rows: [
          { id: '1', name: 'John Doe', status: 'Active', amount: '$250.00' },
          { id: '2', name: 'Jane Smith', status: 'Pending', amount: '$150.00' },
        ],
        showHeader: true,
        striped: false,
      },
      styleSourceIds: ['style-table-wrapper'],
      children: [],
    },
    defaultStyles: {
      'style-table-wrapper': createStyleEntry({
        width: '100%',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        overflow: 'hidden',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TABS
  // ---------------------------------------------------------------------------
  const tabsId = generateId();
  const tabsListId = generateId();
  const tab1Id = generateId();
  const tab2Id = generateId();
  const tab3Id = generateId();
  const tabsContentId = generateId();

  prebuilts.push({
    id: 'system-tabs',
    name: 'Tabs',
    category: 'Navigation',
    instance: {
      id: tabsId,
      type: 'Tabs' as ComponentType,
      label: 'Tabs',
      props: {
        tabs: [
          { id: 'account', label: 'Account', content: 'Account settings and preferences.' },
          { id: 'password', label: 'Password', content: 'Change your password here.' },
          { id: 'settings', label: 'Settings', content: 'Other settings.' },
        ],
        defaultTab: 'account',
      },
      styleSourceIds: ['style-tabs'],
      children: [],
    },
    defaultStyles: {
      'style-tabs': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }),
      'style-tabs-list': createStyleEntry({
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid hsl(var(--border))',
        marginBottom: '16px',
      }),
      'style-tab': createStyleEntry({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--muted-foreground))',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }),
      'style-tab-active': createStyleEntry({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '2px solid hsl(var(--primary))',
        cursor: 'pointer',
      }),
      'style-tab-content': createStyleEntry({
        padding: '16px 0',
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TEXTAREA
  // ---------------------------------------------------------------------------
  const textareaGroupId = generateId();
  const textareaLabelId = generateId();
  const textareaFieldId = generateId();

  prebuilts.push({
    id: 'system-textarea',
    name: 'Textarea',
    category: 'Form Elements',
    instance: {
      id: textareaGroupId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-textarea-group'],
      children: [
        {
          id: textareaLabelId,
          type: 'InputLabel' as ComponentType,
          label: 'InputLabel',
          props: { children: 'Message' },
          styleSourceIds: ['style-textarea-label'],
          children: [],
        },
        {
          id: textareaFieldId,
          type: 'TextArea' as ComponentType,
          label: 'TextArea',
          props: { placeholder: 'Type your message here...' },
          styleSourceIds: ['style-textarea-field'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-textarea-group': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
      }),
      'style-textarea-label': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-textarea-field': createStyleEntry({
        width: '100%',
        minHeight: '100px',
        padding: '10px 12px',
        fontSize: '14px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        borderRadius: '6px',
        color: 'hsl(var(--foreground))',
        resize: 'vertical',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TOAST
  // ---------------------------------------------------------------------------
  const toastId = generateId();
  const toastContentId = generateId();
  const toastTitleId = generateId();
  const toastDescId = generateId();
  const toastCloseId = generateId();

  prebuilts.push({
    id: 'system-toast',
    name: 'Toast',
    category: 'Feedback',
    instance: {
      id: toastId,
      type: 'Div' as ComponentType,
      label: 'Div',
      props: {},
      styleSourceIds: ['style-toast'],
      children: [
        {
          id: toastContentId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-toast-content'],
          children: [
            {
              id: toastTitleId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Success!' },
              styleSourceIds: ['style-toast-title'],
              children: [],
            },
            {
              id: toastDescId,
              type: 'Text' as ComponentType,
              label: 'Text',
              props: { children: 'Your changes have been saved.' },
              styleSourceIds: ['style-toast-desc'],
              children: [],
            },
          ],
        },
        {
          id: toastCloseId,
          type: 'Button' as ComponentType,
          label: 'Button',
          props: { children: '×' },
          styleSourceIds: ['style-toast-close'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-toast': createStyleEntry({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
        maxWidth: '360px',
      }),
      'style-toast-content': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: '1',
      }),
      'style-toast-title': createStyleEntry({
        fontSize: '14px',
        fontWeight: '600',
        color: 'hsl(var(--foreground))',
      }),
      'style-toast-desc': createStyleEntry({
        fontSize: '13px',
        color: 'hsl(var(--muted-foreground))',
      }),
      'style-toast-close': createStyleEntry({
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        fontSize: '18px',
        color: 'hsl(var(--muted-foreground))',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TOGGLE
  // ---------------------------------------------------------------------------
  const toggleId = generateId();
  const toggleTextId = generateId();

  prebuilts.push({
    id: 'system-toggle',
    name: 'Toggle',
    category: 'Form Elements',
    instance: {
      id: toggleId,
      type: 'Toggle' as ComponentType,
      label: 'Toggle',
      props: {
        label: 'B',
        pressed: false,
        variant: 'default',
      },
      styleSourceIds: ['style-toggle'],
      children: [],
    },
    defaultStyles: {
      'style-toggle': createStyleEntry({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        backgroundColor: 'hsl(var(--accent))',
        borderRadius: '6px',
        cursor: 'pointer',
      }),
      'style-toggle-text': createStyleEntry({
        fontSize: '14px',
        fontWeight: '600',
        color: 'hsl(var(--accent-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TOGGLE GROUP
  // ---------------------------------------------------------------------------
  const toggleGroupId = generateId();
  const toggle1Id = generateId();
  const toggle2Id = generateId();
  const toggle3Id = generateId();

  prebuilts.push({
    id: 'system-toggle-group',
    name: 'Toggle Group',
    category: 'Form Elements',
    instance: {
      id: toggleGroupId,
      type: 'ToggleGroup' as ComponentType,
      label: 'ToggleGroup',
      props: {
        items: [
          { id: '1', label: 'B', value: 'bold' },
          { id: '2', label: 'I', value: 'italic' },
          { id: '3', label: 'U', value: 'underline' },
        ],
        type: 'multiple',
        defaultValue: ['bold'],
      },
      styleSourceIds: ['style-toggle-group'],
      children: [],
    },
    defaultStyles: {
      'style-toggle-group': createStyleEntry({
        display: 'inline-flex',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '6px',
        padding: '2px',
        gap: '2px',
      }),
      'style-toggle-item-active': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(var(--background))',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-toggle-item': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
      'style-toggle-item-2': createStyleEntry({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // TOOLTIP
  // ---------------------------------------------------------------------------
  const tooltipId = generateId();
  const tooltipTriggerId = generateId();
  const tooltipContentId = generateId();

  prebuilts.push({
    id: 'system-tooltip',
    name: 'Tooltip',
    category: 'Interactive',
    instance: {
      id: tooltipId,
      type: 'Tooltip' as ComponentType,
      label: 'Tooltip',
      props: {
        triggerText: 'Hover me',
        content: 'This is a tooltip',
        side: 'top',
      },
      styleSourceIds: ['style-tooltip'],
      children: [],
    },
    defaultStyles: {
      'style-tooltip': createStyleEntry({
        position: 'relative',
        display: 'inline-block',
      }),
      'style-tooltip-trigger': createStyleEntry({
        padding: '8px 16px',
        backgroundColor: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))',
        borderRadius: '6px',
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
      }),
      'style-tooltip-content': createStyleEntry({
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
        padding: '6px 12px',
        backgroundColor: 'hsl(var(--foreground))',
        color: 'hsl(var(--background))',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
      }),
    },
  });


  // ---------------------------------------------------------------------------
  // ALERT (Simple notification style)
  // ---------------------------------------------------------------------------
  const alertId = generateId();
  const alertIconId = generateId();
  const alertContentId = generateId();
  const alertTitleId = generateId();
  const alertDescId = generateId();

  prebuilts.push({
    id: 'system-alert',
    name: 'Alert',
    category: 'Feedback',
    instance: {
      id: alertId,
      type: 'Alert' as ComponentType,
      label: 'Alert',
      props: {
        title: 'Heads up!',
        description: 'You can add components to your app using the CLI.',
        variant: 'default',
      },
      styleSourceIds: ['style-alert'],
      children: [],
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
  // NAVIGATION COMPONENT
  // ---------------------------------------------------------------------------
  const navId = generateId();

  prebuilts.push({
    id: 'system-navigation',
    name: 'Navigation',
    category: 'Layout',
    instance: {
      id: navId,
      type: 'Navigation' as ComponentType,
      label: 'Navigation',
      props: {
        logo: 'Brand',
        template: 'logo-left-menu-right',
        menuItems: [
          { text: 'Home', url: '#', id: '1' },
          { text: 'About', url: '#', id: '2' },
          { text: 'Services', url: '#', id: '3' },
          { text: 'Contact', url: '#', id: '4' },
        ],
        showCTA: true,
        ctaText: 'Get Started',
        ctaUrl: '#',
        mobileBreakpoint: 768,
        mobileAnimation: 'slide',
        animationDuration: 300,
        hamburgerStyle: 'classic',
        animateIcon: true,
        hoverPreset: 'underline-slide',
        activePreset: 'underline',
      },
      styleSourceIds: ['style-navigation'],
      children: [],
    },
    defaultStyles: {
      'style-navigation': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '16px 24px',
        backgroundColor: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))',
      }),
    },
  });

  return prebuilts;
};
