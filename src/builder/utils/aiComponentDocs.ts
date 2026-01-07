import { componentRegistry } from '../primitives/registry';
import { createSystemPrebuilts } from './systemPrebuilts';

// Component categories for organized documentation
const COMPONENT_CATEGORIES = {
  layout: ['Section', 'Container', 'Div'],
  typography: ['Heading', 'Text', 'RichText', 'Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock'],
  media: ['Image', 'Video', 'Youtube', 'Lottie'],
  forms: ['Form', 'TextInput', 'TextArea', 'Select', 'Checkbox', 'Radio', 'InputLabel', 'FormButton'],
  actions: ['Button', 'Link', 'Dropdown'],
  dataDisplay: ['Table', 'Cell', 'Accordion', 'Tabs', 'Carousel'],
  navigation: ['Navigation'],
  feedback: ['Alert', 'Badge', 'Progress', 'Tooltip'],
  overlays: ['AlertDialog', 'Drawer', 'Popover', 'Sheet'],
  misc: ['Avatar', 'Breadcrumb', 'Pagination', 'OTPInput', 'Slider', 'Switch', 'Toggle', 'ToggleGroup'],
};

// Generate component documentation for AI prompt
export function generateComponentDocs(): string {
  const docs: string[] = [];

  docs.push('## Available Components\n');

  for (const [category, types] of Object.entries(COMPONENT_CATEGORIES)) {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
    docs.push(`### ${categoryTitle}`);

    for (const type of types) {
      const meta = componentRegistry[type];
      if (!meta) continue;

      const propsList = Object.entries(meta.propsDefinition || {})
        .map(([key, def]) => `${key}: ${(def as { type: string }).type}`)
        .join(', ');

      docs.push(`- **${type}**: ${meta.label}${propsList ? ` (props: ${propsList})` : ''}`);
    }
    docs.push('');
  }

  return docs.join('\n');
}

// Generate simplified prebuilt examples for AI
export function generatePrebuiltExamples(): string {
  const prebuilts = createSystemPrebuilts();
  const examples: string[] = [];

  examples.push('## Section Pattern Examples\n');

  // Include key prebuilts as examples
  const keyPrebuilts = ['system-hero-section', 'system-feature-card', 'system-cta-section', 'system-testimonial-card', 'system-footer'];

  for (const id of keyPrebuilts) {
    const prebuilt = prebuilts.find(p => p.id === id);
    if (!prebuilt) continue;

    examples.push(`### ${prebuilt.name}`);
    examples.push('```json');
    examples.push(JSON.stringify(simplifyInstance(prebuilt.instance, prebuilt.defaultStyles), null, 2));
    examples.push('```\n');
  }

  return examples.join('\n');
}

// Simplify instance for AI consumption (remove internal IDs, flatten styles)
function simplifyInstance(
  instance: { type: string; props: Record<string, unknown>; styleSourceIds: string[]; children: unknown[] },
  styles: Record<string, Record<string, string>>
): Record<string, unknown> {
  const styleSourceId = instance.styleSourceIds?.[0];
  const instanceStyles = styleSourceId ? styles[styleSourceId] : {};

  return {
    type: instance.type,
    props: instance.props,
    styles: instanceStyles,
    children: (instance.children || []).map((child) =>
      simplifyInstance(child as typeof instance, styles)
    ),
  };
}

// Generate design tokens reference
export function generateDesignTokens(): string {
  return `## Design Tokens

Use CSS variables for consistent theming:

### Colors
- \`hsl(var(--background))\` - Page background
- \`hsl(var(--foreground))\` - Primary text color
- \`hsl(var(--primary))\` - Brand/accent color
- \`hsl(var(--primary-foreground))\` - Text on primary backgrounds
- \`hsl(var(--secondary))\` - Secondary backgrounds
- \`hsl(var(--muted))\` - Muted backgrounds
- \`hsl(var(--muted-foreground))\` - Muted text
- \`hsl(var(--accent))\` - Accent backgrounds
- \`hsl(var(--card))\` - Card backgrounds
- \`hsl(var(--border))\` - Border colors
- \`hsl(var(--destructive))\` - Error/danger color

### Spacing Scale
- Small: 8px, 12px, 16px
- Medium: 24px, 32px
- Large: 48px, 64px, 80px

### Border Radius
- Subtle: 4px
- Standard: 8px
- Prominent: 12px, 16px

### Font Sizes
- Small text: 14px
- Body: 16px
- Large body: 18px, 20px
- Headings: 24px, 32px, 40px, 48px, 56px

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
`;
}

// Generate layout guidelines
export function generateLayoutGuidelines(): string {
  return `## Layout Guidelines

### Section Structure
Always use this hierarchy for page sections:
\`\`\`
Section (full-width wrapper)
  └── Container (centered, max-width content)
       └── Content (Divs, text, buttons, etc.)
\`\`\`

### Flex Containers
- Use \`display: flex\` with \`flexDirection: column\` for vertical stacking
- Use \`display: flex\` with \`flexDirection: row\` for horizontal layouts
- Use \`gap\` property for consistent spacing between children

### Grid Layouts (Feature Cards, etc.)
Use parent Div with:
- \`display: grid\`
- \`gridTemplateColumns: repeat(3, 1fr)\` for 3-column
- \`gap: 24px\` or \`gap: 32px\`

### Centering Content
- Horizontal center: \`alignItems: center\` (on flex column) or \`margin: 0 auto\`
- Vertical center: \`justifyContent: center\` (on flex column)
- Text center: \`textAlign: center\`

### Common Section Padding
- Hero sections: \`padding: 80px 24px\`
- Regular sections: \`padding: 64px 24px\`
- Compact sections: \`padding: 48px 24px\`
`;
}

// Build complete AI context
export function buildAIContext(): string {
  return [
    generateComponentDocs(),
    generateDesignTokens(),
    generateLayoutGuidelines(),
    generatePrebuiltExamples(),
  ].join('\n\n');
}
