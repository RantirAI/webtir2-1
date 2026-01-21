import { ComponentInstance, ComponentType } from '../store/types';
import { generateId } from './instance';

export interface SystemPrebuiltDefinition {
  id: string;
  name: string;
  category: string;
  instance: ComponentInstance;
  defaultStyles: Record<string, Record<string, string>>; // styleSourceId -> property -> value (base breakpoint)
  tabletStyles?: Record<string, Record<string, string>>; // styleSourceId -> property -> value (tablet breakpoint)
  mobileStyles?: Record<string, Record<string, string>>; // styleSourceId -> property -> value (mobile breakpoint)
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
  const testimonialAvatarContainerId = generateId();
  const testimonialAvatarImageId = generateId();
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
      props: {
        showAvatar: true,
        avatarShape: 'circle',
        avatarSize: 'md',
        avatarPosition: 'top',
        avatarBorderStyle: 'none',
        avatarShadow: 'none',
        showRating: false,
        rating: 5,
        // Hover effects
        hoverEffect: 'none',
        glowColor: 'hsl(var(--primary))',
        // Carousel/Display mode
        displayMode: 'single',
        testimonials: [
          { id: 'default-1', quote: '"This product has completely transformed our workflow. Highly recommended!"', name: 'John Doe', role: 'CEO at Company', rating: 5 }
        ],
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        navigationStyle: 'arrows',
        cardsPerView: '1',
      },
      styleSourceIds: ['style-testimonial-card'],
      children: [
        {
          id: testimonialAvatarContainerId,
          type: 'Div' as ComponentType,
          label: 'Div',
          props: {},
          styleSourceIds: ['style-testimonial-avatar-container'],
          children: [
            {
              id: testimonialAvatarImageId,
              type: 'Image' as ComponentType,
              label: 'Image',
              props: { 
                src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                alt: 'Profile picture'
              },
              styleSourceIds: ['style-testimonial-avatar-image'],
              children: [],
            },
          ],
        },
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
        alignItems: 'center',
        gap: '24px',
        padding: '32px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px',
        textAlign: 'center',
      }),
      'style-testimonial-avatar-container': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      'style-testimonial-avatar-image': createStyleEntry({
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        objectFit: 'cover',
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
        alignItems: 'center',
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
  // ACCORDION
  // ---------------------------------------------------------------------------
  const accordionId = generateId();
  const accordionItem1Id = generateId();
  const accordionItem2Id = generateId();
  const accordionItem3Id = generateId();
  const accordionHeading1Id = generateId();
  const accordionHeading2Id = generateId();
  const accordionHeading3Id = generateId();

  prebuilts.push({
    id: 'system-accordion',
    name: 'Accordion',
    category: 'Interactive',
    instance: {
      id: accordionId,
      type: 'Accordion' as ComponentType,
      label: 'Accordion',
      props: {
        accordionStyles: {
          collapseMode: 'single',
          iconPosition: 'right',
          iconStyle: 'chevron',
        }
      },
      styleSourceIds: ['style-accordion'],
      children: [
        {
          id: accordionItem1Id,
          type: 'AccordionItem' as ComponentType,
          label: 'Section 1',
          props: { defaultOpen: true },
          styleSourceIds: ['style-accordion-item'],
          children: [
            {
              id: accordionHeading1Id,
              type: 'Heading' as ComponentType,
              label: 'Section Title',
              props: { children: 'Section 1', level: 'h3' },
              styleSourceIds: ['style-accordion-heading'],
              children: [],
            },
          ],
        },
        {
          id: accordionItem2Id,
          type: 'AccordionItem' as ComponentType,
          label: 'Section 2',
          props: { defaultOpen: false },
          styleSourceIds: ['style-accordion-item-2'],
          children: [
            {
              id: accordionHeading2Id,
              type: 'Heading' as ComponentType,
              label: 'Section Title',
              props: { children: 'Section 2', level: 'h3' },
              styleSourceIds: ['style-accordion-heading'],
              children: [],
            },
          ],
        },
        {
          id: accordionItem3Id,
          type: 'AccordionItem' as ComponentType,
          label: 'Section 3',
          props: { defaultOpen: false },
          styleSourceIds: ['style-accordion-item-3'],
          children: [
            {
              id: accordionHeading3Id,
              type: 'Heading' as ComponentType,
              label: 'Section Title',
              props: { children: 'Section 3', level: 'h3' },
              styleSourceIds: ['style-accordion-heading'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-accordion': createStyleEntry({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }),
      'style-accordion-item': createStyleEntry({
        width: '100%',
      }),
      'style-accordion-item-2': createStyleEntry({
        width: '100%',
      }),
      'style-accordion-item-3': createStyleEntry({
        width: '100%',
      }),
      'style-accordion-heading': createStyleEntry({
        fontSize: '16px',
        fontWeight: '500',
        margin: '0',
      }),
    },
  });


  // ---------------------------------------------------------------------------
  // BREADCRUMB - Container-based children architecture
  // ---------------------------------------------------------------------------
  const breadcrumbId = generateId();
  const breadcrumbItem1Id = generateId();
  const breadcrumbItem2Id = generateId();
  const breadcrumbItem3Id = generateId();

  prebuilts.push({
    id: 'system-breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    instance: {
      id: breadcrumbId,
      type: 'Breadcrumb' as ComponentType,
      label: 'Breadcrumb',
      props: {
        separator: '/',
        breadcrumbSettings: {},
        breadcrumbStyles: {},
      },
      styleSourceIds: ['style-breadcrumb'],
      children: [
        {
          id: breadcrumbItem1Id,
          type: 'BreadcrumbItem' as ComponentType,
          label: 'Home',
          props: { label: 'Home', href: '/', isCurrentPage: false },
          styleSourceIds: ['style-breadcrumb-item-1'],
          children: [],
        },
        {
          id: breadcrumbItem2Id,
          type: 'BreadcrumbItem' as ComponentType,
          label: 'Products',
          props: { label: 'Products', href: '/products', isCurrentPage: false },
          styleSourceIds: ['style-breadcrumb-item-2'],
          children: [],
        },
        {
          id: breadcrumbItem3Id,
          type: 'BreadcrumbItem' as ComponentType,
          label: 'Current Page',
          props: { label: 'Current Page', href: '', isCurrentPage: true },
          styleSourceIds: ['style-breadcrumb-item-current'],
          children: [],
        },
      ],
    },
    defaultStyles: {
      'style-breadcrumb': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }),
      'style-breadcrumb-item-1': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-breadcrumb-item-2': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
      }),
      'style-breadcrumb-item-current': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--foreground))',
      }),
      'style-breadcrumb-separator': createStyleEntry({
        fontSize: '14px',
        color: 'hsl(var(--muted-foreground))',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CALENDAR - Container with Header, DayPicker, and Footer slots
  // ---------------------------------------------------------------------------
  const calendarId = generateId();
  const calendarHeaderId = generateId();
  const calendarDayPickerId = generateId();
  const calendarFooterId = generateId();
  const calendarTodayBtnId = generateId();

  prebuilts.push({
    id: 'system-calendar',
    name: 'Calendar',
    category: 'Form Elements',
    instance: {
      id: calendarId,
      type: 'Calendar' as ComponentType,
      label: 'Calendar',
      props: {
        calendarSettings: {
          mode: 'single',           // 'single' | 'range' | 'multiple'
          weekStartsOn: 0,          // 0 = Sunday, 1 = Monday
          showOutsideDays: true,
          showWeekNumber: false,
          numberOfMonths: 1,
          defaultMonth: null,       // null = current month
          fromDate: null,           // min date bound (YYYY-MM-DD)
          toDate: null,             // max date bound (YYYY-MM-DD)
        },
      },
      styleSourceIds: ['style-calendar'],
      children: [
        {
          id: calendarHeaderId,
          type: 'CalendarHeader' as ComponentType,
          label: 'Header',
          props: {},
          styleSourceIds: ['style-calendar-header'],
          children: [],
        },
        {
          id: calendarDayPickerId,
          type: 'CalendarDayPicker' as ComponentType,
          label: 'Day Picker',
          props: {},
          styleSourceIds: ['style-calendar-daypicker'],
          children: [],
        },
        {
          id: calendarFooterId,
          type: 'CalendarFooter' as ComponentType,
          label: 'Footer',
          props: {},
          styleSourceIds: ['style-calendar-footer'],
          children: [
            {
              id: calendarTodayBtnId,
              type: 'Button' as ComponentType,
              label: 'Button',
              props: { children: 'Today' },
              styleSourceIds: ['style-calendar-today-btn'],
              children: [],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-calendar': createStyleEntry({
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
      }),
      'style-calendar-header': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '24px',
      }),
      'style-calendar-daypicker': createStyleEntry({
        display: 'block',
      }),
      'style-calendar-footer': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        paddingTop: '8px',
        borderTop: '1px solid hsl(var(--border))',
      }),
      'style-calendar-today-btn': createStyleEntry({
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '6px',
      }),
    },
  });

  // ---------------------------------------------------------------------------
  // CAROUSEL
  // ---------------------------------------------------------------------------
  const carouselId = generateId();
  const carouselSlide1Id = generateId();
  const carouselSlide2Id = generateId();
  const carouselSlide3Id = generateId();

  prebuilts.push({
    id: 'system-carousel',
    name: 'Carousel',
    category: 'Interactive',
    instance: {
      id: carouselId,
      type: 'Carousel' as ComponentType,
      label: 'Carousel',
      props: {
        autoPlay: false,
        loop: true,
        showArrows: true,
        showDots: true,
      },
      styleSourceIds: ['style-carousel'],
      children: [
        {
          id: carouselSlide1Id,
          type: 'CarouselSlide' as ComponentType,
          label: 'Slide 1',
          props: { title: 'Slide 1', description: 'First slide content' },
          children: [],
          styleSourceIds: ['style-carousel-slide'],
        },
        {
          id: carouselSlide2Id,
          type: 'CarouselSlide' as ComponentType,
          label: 'Slide 2',
          props: { title: 'Slide 2', description: 'Second slide content' },
          children: [],
          styleSourceIds: ['style-carousel-slide-2'],
        },
        {
          id: carouselSlide3Id,
          type: 'CarouselSlide' as ComponentType,
          label: 'Slide 3',
          props: { title: 'Slide 3', description: 'Third slide content' },
          children: [],
          styleSourceIds: ['style-carousel-slide-3'],
        },
      ],
    },
    defaultStyles: {
      'style-carousel': createStyleEntry({
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
      }),
      'style-carousel-slide': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        minHeight: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
      }),
      'style-carousel-slide-2': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        minHeight: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
      }),
      'style-carousel-slide-3': createStyleEntry({
        flexShrink: '0',
        width: '100%',
        minHeight: '200px',
        backgroundColor: 'hsl(var(--muted))',
        borderRadius: '8px',
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
      type: 'Separator' as ComponentType,
      label: 'Separator',
      props: {
        separatorSettings: {
          orientation: 'horizontal',
          lineType: 'solid',
          thickness: '1px',
          length: '100%',
          spacing: '16px',
          decorative: true,
        },
        'aria-hidden': 'true',
        role: 'presentation',
      },
      styleSourceIds: ['style-separator'],
      children: [],
    },
    defaultStyles: {
      'style-separator': createStyleEntry({
        width: '100%',
        height: '1px',
        backgroundColor: 'hsl(var(--border))',
        marginTop: '16px',
        marginBottom: '16px',
      }),
    },
  });


  // ---------------------------------------------------------------------------
  // TABLE
  // ---------------------------------------------------------------------------
  const tableId = generateId();
  const tableHeaderId = generateId();
  // Table row/cell IDs
  const tableHeaderRowId = generateId();
  const tableRow1Id = generateId();
  const tableRow2Id = generateId();
  const headerCell1Id = generateId();
  const headerCell2Id = generateId();
  const headerCell3Id = generateId();
  const cell1_1Id = generateId();
  const cell1_2Id = generateId();
  const cell1_3Id = generateId();
  const cell2_1Id = generateId();
  const cell2_2Id = generateId();
  const cell2_3Id = generateId();

  prebuilts.push({
    id: 'system-table',
    name: 'Table',
    category: 'Data Display',
    instance: {
      id: tableId,
      type: 'Table' as ComponentType,
      label: 'Table',
      props: {
        tableStyles: {
          template: 'simple',
          headerBackground: 'hsl(var(--muted))',
          headerTextColor: 'hsl(var(--foreground))',
          headerFontWeight: '600',
          headerFontSize: '14',
          cellBackground: 'transparent',
          cellTextColor: 'hsl(var(--foreground))',
          cellFontSize: '14',
          cellPadding: '12',
          borderStyle: 'horizontal',
          borderColor: 'hsl(var(--border))',
          borderWidth: '1',
          outerBorderRadius: '8',
          tableBackground: 'transparent',
          tableShadow: 'none',
        },
      },
      styleSourceIds: ['style-table-wrapper'],
      children: [
        // Header Row
        {
          id: tableHeaderRowId,
          type: 'TableRow' as ComponentType,
          label: 'Header Row',
          props: { isHeader: true },
          children: [
            { id: headerCell1Id, type: 'TableHeaderCell' as ComponentType, label: 'Name', props: { content: 'Name' }, children: [], styleSourceIds: [] },
            { id: headerCell2Id, type: 'TableHeaderCell' as ComponentType, label: 'Status', props: { content: 'Status' }, children: [], styleSourceIds: [] },
            { id: headerCell3Id, type: 'TableHeaderCell' as ComponentType, label: 'Amount', props: { content: 'Amount' }, children: [], styleSourceIds: [] },
          ],
          styleSourceIds: [],
        },
        // Data Row 1
        {
          id: tableRow1Id,
          type: 'TableRow' as ComponentType,
          label: 'Row 1',
          props: { isHeader: false },
          children: [
            { id: cell1_1Id, type: 'TableCell' as ComponentType, label: 'John Doe', props: { content: 'John Doe' }, children: [], styleSourceIds: [] },
            { id: cell1_2Id, type: 'TableCell' as ComponentType, label: 'Active', props: { content: 'Active' }, children: [], styleSourceIds: [] },
            { id: cell1_3Id, type: 'TableCell' as ComponentType, label: '$250.00', props: { content: '$250.00' }, children: [], styleSourceIds: [] },
          ],
          styleSourceIds: [],
        },
        // Data Row 2
        {
          id: tableRow2Id,
          type: 'TableRow' as ComponentType,
          label: 'Row 2',
          props: { isHeader: false },
          children: [
            { id: cell2_1Id, type: 'TableCell' as ComponentType, label: 'Jane Smith', props: { content: 'Jane Smith' }, children: [], styleSourceIds: [] },
            { id: cell2_2Id, type: 'TableCell' as ComponentType, label: 'Pending', props: { content: 'Pending' }, children: [], styleSourceIds: [] },
            { id: cell2_3Id, type: 'TableCell' as ComponentType, label: '$150.00', props: { content: '$150.00' }, children: [], styleSourceIds: [] },
          ],
          styleSourceIds: [],
        },
      ],
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
  const tabPanel1Id = generateId();
  const tabPanel2Id = generateId();
  const tabPanel3Id = generateId();
  const tabTrigger1Id = generateId();
  const tabTrigger2Id = generateId();
  const tabTrigger3Id = generateId();

  prebuilts.push({
    id: 'system-tabs',
    name: 'Tabs',
    category: 'Navigation',
    instance: {
      id: tabsId,
      type: 'Tabs' as ComponentType,
      label: 'Tabs',
      props: {
        defaultTab: tabPanel1Id,
      },
      styleSourceIds: ['style-tabs'],
      children: [
        {
          id: tabPanel1Id,
          type: 'TabPanel' as ComponentType,
          label: 'Tab 1',
          props: { content: 'Account settings and preferences.' },
          children: [
            {
              id: tabTrigger1Id,
              type: 'TabTrigger' as ComponentType,
              label: 'Account',
              props: { text: 'Account' },
              children: [],
              styleSourceIds: ['style-tab-trigger'],
            },
          ],
          styleSourceIds: ['style-tab-panel'],
        },
        {
          id: tabPanel2Id,
          type: 'TabPanel' as ComponentType,
          label: 'Tab 2',
          props: { content: 'Change your password here.' },
          children: [
            {
              id: tabTrigger2Id,
              type: 'TabTrigger' as ComponentType,
              label: 'Password',
              props: { text: 'Password' },
              children: [],
              styleSourceIds: ['style-tab-trigger'],
            },
          ],
          styleSourceIds: ['style-tab-panel'],
        },
        {
          id: tabPanel3Id,
          type: 'TabPanel' as ComponentType,
          label: 'Tab 3',
          props: { content: 'Other settings.' },
          children: [
            {
              id: tabTrigger3Id,
              type: 'TabTrigger' as ComponentType,
              label: 'Settings',
              props: { text: 'Settings' },
              children: [],
              styleSourceIds: ['style-tab-trigger'],
            },
          ],
          styleSourceIds: ['style-tab-panel'],
        },
      ],
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
  // NAVIGATION COMPONENT (Composition-based with slots - editable children)
  // ---------------------------------------------------------------------------
  // Uses 3-slot structure: Left Slot | Center Slot | Right Slot
  // Logo position is controlled by moving elements between slots (not CSS order)
  const navId = generateId();
  const navContainerId = generateId();
  const navLeftSlotId = generateId();
  const navCenterSlotId = generateId();
  const navRightSlotId = generateId();
  const navLogoId = generateId();
  const navMenuId = generateId();
  const navMenuItem1Id = generateId();
  const navMenuItem2Id = generateId();
  const navMenuItem3Id = generateId();
  const navMenuItem4Id = generateId();
  

  prebuilts.push({
    id: 'system-navigation',
    name: 'Navigation',
    category: 'Layout',
    instance: {
      id: navId,
      type: 'Section' as ComponentType,
      label: 'Section',
      props: { htmlTag: 'nav', logoPosition: 'left' },
      styleSourceIds: ['style-nav-wrapper'],
      children: [
        {
          id: navContainerId,
          type: 'Container' as ComponentType,
          label: 'Container',
          props: {},
          styleSourceIds: ['style-nav-container'],
          children: [
            // Left Slot - contains logo by default
            {
              id: navLeftSlotId,
              type: 'Div' as ComponentType,
              label: 'Left Slot',
              props: { _isNavSlot: true },
              styleSourceIds: ['style-nav-slot-left'],
              children: [
                {
                  id: navLogoId,
                  type: 'Text' as ComponentType,
                  label: 'Text',
                  props: { children: 'Brand' },
                  styleSourceIds: ['style-nav-logo'],
                  children: [],
                },
              ],
            },
            // Center Slot - empty by default
            {
              id: navCenterSlotId,
              type: 'Div' as ComponentType,
              label: 'Center Slot',
              props: { _isNavSlot: true },
              styleSourceIds: ['style-nav-slot-center'],
              children: [],
            },
            // Right Slot - contains menu by default
            {
              id: navRightSlotId,
              type: 'Div' as ComponentType,
              label: 'Right Slot',
              props: { _isNavSlot: true },
              styleSourceIds: ['style-nav-slot-right'],
              children: [
                {
                  id: navMenuId,
                  type: 'Div' as ComponentType,
                  label: 'Div',
                  props: {},
                  styleSourceIds: ['style-nav-menu'],
                  children: [
                    {
                      id: navMenuItem1Id,
                      type: 'Link' as ComponentType,
                      label: 'Link',
                      props: { children: 'Home', href: '#' },
                      styleSourceIds: ['style-nav-link'],
                      children: [],
                    },
                    {
                      id: navMenuItem2Id,
                      type: 'Link' as ComponentType,
                      label: 'Link',
                      props: { children: 'About', href: '#' },
                      styleSourceIds: ['style-nav-link'],
                      children: [],
                    },
                    {
                      id: navMenuItem3Id,
                      type: 'Link' as ComponentType,
                      label: 'Link',
                      props: { children: 'Services', href: '#' },
                      styleSourceIds: ['style-nav-link'],
                      children: [],
                    },
                    {
                      id: navMenuItem4Id,
                      type: 'Link' as ComponentType,
                      label: 'Link',
                      props: { children: 'Contact', href: '#' },
                      styleSourceIds: ['style-nav-link'],
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    defaultStyles: {
      'style-nav-wrapper': createStyleEntry({
        display: 'flex',
        width: '100%',
        minHeight: 'auto',
        backgroundColor: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))',
      }),
      'style-nav-container': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        gap: '24px',
      }),
      'style-nav-slot-left': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: '1',
        justifyContent: 'flex-start',
        minWidth: '0',
      }),
      'style-nav-slot-center': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
      }),
      'style-nav-slot-right': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: '1',
        justifyContent: 'flex-end',
        minWidth: '0',
      }),
      'style-nav-logo': createStyleEntry({
        fontSize: '20px',
        fontWeight: '700',
        color: 'hsl(var(--foreground))',
        flexShrink: '0',
      }),
      'style-nav-menu': createStyleEntry({
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        minWidth: '0',
        flexShrink: '1',
      }),
      'style-nav-link': createStyleEntry({
        fontSize: '14px',
        fontWeight: '500',
        color: 'hsl(var(--muted-foreground))',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }),
    },
    tabletStyles: {
      'style-nav-container': createStyleEntry({
        padding: '12px 16px',
        gap: '16px',
      }),
      'style-nav-menu': createStyleEntry({
        gap: '16px',
      }),
      'style-nav-link': createStyleEntry({
        fontSize: '13px',
      }),
    },
    mobileStyles: {
      'style-nav-container': createStyleEntry({
        padding: '12px 16px',
        gap: '12px',
      }),
      'style-nav-menu': createStyleEntry({
        display: 'none',
      }),
    },
  });

  return prebuilts;
};
