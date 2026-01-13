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

// Generate color palettes for vibrant designs
export function generateColorPalettes(): string {
  return `## Color Palettes for Dynamic Designs

### CRITICAL: Be Creative with Colors
DO NOT default to black/white/gray. Infer colors from user context and create VIBRANT designs.

### Industry-Specific Color Suggestions
| Context | Primary | Secondary | Accent | Background Options |
|---------|---------|-----------|--------|-------------------|
| Tech/SaaS/AI | #6366F1 (Indigo) | #8B5CF6 (Purple) | #06B6D4 (Cyan) | Dark: #0F172A, Light: #F8FAFC |
| Startup/Energetic | #F97316 (Orange) | #EAB308 (Yellow) | #14B8A6 (Teal) | #FFFBEB, #1C1917 |
| Nature/Health/Eco | #22C55E (Green) | #84CC16 (Lime) | #10B981 (Emerald) | #F0FDF4, #14532D |
| Creative/Bold | #EC4899 (Pink) | #A855F7 (Purple) | #F43F5E (Rose) | #FDF2F8, #831843 |
| Finance/Corporate | #3B82F6 (Blue) | #1E3A8A (Navy) | #0EA5E9 (Sky) | #F1F5F9, #1E3A5F |
| Luxury/Premium | #F59E0B (Amber) | #78716C (Stone) | #D97706 (Orange) | #18181B, #FFFBEB |
| Food/Restaurant | #EF4444 (Red) | #F97316 (Orange) | #78350F (Brown) | #FEF2F2, #1C1917 |
| Kids/Education | #3B82F6 (Blue) | #FACC15 (Yellow) | #EF4444 (Red) | #FFFFFF, #FEF3C7 |
| Fitness/Sports | #EF4444 (Red) | #F97316 (Orange) | #22C55E (Green) | #18181B, #FAFAFA |
| Fashion/Beauty | #EC4899 (Pink) | #F43F5E (Rose) | #A855F7 (Purple) | #FDF2F8, #18181B |

### Gradient Backgrounds (Use for Hero sections, CTAs, Feature cards)
- **Sunset**: linear-gradient(135deg, #F97316 0%, #EC4899 100%)
- **Ocean**: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)
- **Aurora**: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #22C55E 100%)
- **Fire**: linear-gradient(135deg, #EF4444 0%, #F97316 50%, #EAB308 100%)
- **Night Sky**: linear-gradient(135deg, #1E293B 0%, #6366F1 100%)
- **Forest**: linear-gradient(135deg, #14532D 0%, #22C55E 100%)
- **Candy**: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)
- **Coral**: linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)
- **Electric**: linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)
- **Midnight**: linear-gradient(180deg, #0F172A 0%, #1E3A8A 100%)

### When to Use HEX Colors vs CSS Variables
| User Says | Use |
|-----------|-----|
| "colorful", "vibrant", "modern", "bold" | HEX colors from palettes |
| Industry name (tech, restaurant, etc.) | Industry-specific HEX colors |
| "dark mode", "dark theme" | Dark backgrounds with bright accents |
| "minimal", "clean", "simple" | CSS variables for theme-aware |
| "professional", "corporate" | Muted HEX colors or CSS variables |
| No color preference stated | INFER from context, use appropriate HEX colors |

### Text Color Rules
- On light backgrounds (#FFFFFF, #F8FAFC): Use dark text (#1E293B, #0F172A)
- On dark backgrounds (#18181B, #0F172A): Use light text (#FFFFFF, #F8FAFC)
- On colored backgrounds: Use #FFFFFF for most, ensure contrast ratio > 4.5:1
`;
}

// Generate design tokens reference
export function generateDesignTokens(): string {
  return `## Design Tokens (Theme-Aware Fallbacks)

CSS variables for when user wants theme-aware/minimal designs:

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

### Border Radius
- Subtle: 4px
- Standard: 8px
- Prominent: 12px, 16px
- Pill: 999px

### Font Sizes
- Small text: 14px
- Body: 16px
- Large body: 18px, 20px
- Headings: 24px, 32px, 40px, 48px, 56px, 72px

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extra Bold: 800
`;
}

// Generate spacing best practices
export function generateSpacingGuidelines(): string {
  return `## Spacing Best Practices

### Margin vs Padding vs Gap
- **Padding**: Internal spacing within containers (cards, buttons, sections)
- **Margin**: Use sparingly - prefer gap in flex/grid for sibling spacing
- **Gap**: Always use gap for spacing between children in flex/grid containers

### Spacing Scale (use consistently)
| Token | Value | Use Case |
|-------|-------|----------|
| xs    | 4px   | Icon gaps, tight elements |
| sm    | 8px   | Button icon gaps, form labels |
| md    | 16px  | Card padding (compact), input padding |
| lg    | 24px  | Card padding (default), section gaps |
| xl    | 32px  | Between major elements |
| 2xl   | 48px  | Section padding (compact) |
| 3xl   | 64px  | Section padding (default) |
| 4xl   | 80px  | Hero section padding |
| 5xl   | 120px | Large hero sections |

### Section Padding Patterns
- Hero sections: padding: 80px 24px (desktop), 48px 16px (mobile)
- Regular sections: padding: 64px 24px (desktop), 40px 16px (mobile)
- Cards: padding: 24px (desktop), 16px (mobile)
- Buttons: padding: 12px 24px (large), 8px 16px (default)

### Gap Values
- Inline buttons: gap: 12px
- Card grids: gap: 24px (desktop), 16px (mobile)
- Form fields: gap: 16px
- Section content: gap: 24px-32px
`;
}

// Generate responsive layout guidelines
export function generateResponsiveGuidelines(): string {
  return `## Responsive Layouts

### Breakpoints
- **base**: Desktop default (960px+)
- **tablet**: 768px - 991px
- **mobile**: Below 767px

### Responsive Style Format
When generating components, ALWAYS include responsive overrides:

\`\`\`json
{
  "type": "Section",
  "styles": {
    "padding": "80px 24px",
    "minHeight": "100vh"
  },
  "responsiveStyles": {
    "tablet": {
      "padding": "48px 20px"
    },
    "mobile": {
      "padding": "40px 16px",
      "minHeight": "auto"
    }
  },
  "children": [...]
}
\`\`\`

### Responsive Patterns

**Typography Scaling:**
- h1: 56px → tablet: 44px → mobile: 32px
- h2: 40px → tablet: 32px → mobile: 26px
- h3: 28px → tablet: 24px → mobile: 20px
- Body large: 20px → mobile: 16px

**Grid Columns:**
- 4 columns → tablet: 2 columns → mobile: 1 column
- 3 columns → tablet: 2 columns → mobile: 1 column
- 2 columns → mobile: 1 column

**Flex Direction:**
- Row layouts: flexDirection: row → mobile: column
- Always add: flexWrap: wrap for multi-item rows

**Spacing Reduction:**
- Desktop gap/padding × 0.6-0.75 for tablet
- Desktop gap/padding × 0.5 for mobile

**Container Max Widths:**
- Desktop: maxWidth: 1200px
- Tablet: maxWidth: 100%, padding: 20px
- Mobile: maxWidth: 100%, padding: 16px

### Page Layout Modes

**Full-Page (Login, Auth, Landing Hero):**
\`\`\`json
{
  "styles": {
    "minHeight": "100vh",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center"
  }
}
\`\`\`

**Multi-Section Landing Page:**
Generate sections in order: Hero → Features → Testimonials → CTA → Footer
Each section should have appropriate padding and be full-width.
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

// Generate CSS Properties Reference for AI
export function generateCSSReference(): string {
  return `## Complete CSS Properties Reference

### Layout Properties
| Property | Values | Example |
|----------|--------|---------|
| display | flex, grid, block, inline, none | "flex" |
| flexDirection | row, column, row-reverse, column-reverse | "column" |
| justifyContent | flex-start, center, flex-end, space-between, space-around | "center" |
| alignItems | flex-start, center, flex-end, stretch, baseline | "center" |
| flexWrap | wrap, nowrap, wrap-reverse | "wrap" |
| gap | any length | "16px" |
| gridTemplateColumns | repeat, fr, px values | "repeat(3, 1fr)" |

### Sizing Properties
| Property | Values | Example |
|----------|--------|---------|
| width | auto, %, px, vw | "100%" |
| height | auto, %, px, vh | "100vh" |
| minWidth/maxWidth | length values | "800px" |
| minHeight/maxHeight | length values | "100vh" |

### Spacing Properties
| Property | Values | Example |
|----------|--------|---------|
| padding | shorthand or individual | "24px" or "16px 24px" |
| paddingTop/Right/Bottom/Left | length values | "16px" |
| margin | shorthand or individual | "0 auto" |
| marginTop/Right/Bottom/Left | length values | "24px" |

### Color Properties (always use CSS variables)
| Property | Example |
|----------|---------|
| backgroundColor | "hsl(var(--primary))" |
| color | "hsl(var(--foreground))" |
| borderColor | "hsl(var(--border))" |
| background | "linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)))" |

### Typography Properties
| Property | Values | Example |
|----------|--------|---------|
| fontSize | px, rem, em | "18px" |
| fontWeight | 400, 500, 600, 700 | "600" |
| fontFamily | font-stack | "system-ui, sans-serif" |
| lineHeight | number or unit | "1.6" |
| letterSpacing | length | "0.02em" |
| textAlign | left, center, right, justify | "center" |
| textTransform | uppercase, lowercase, capitalize | "uppercase" |
| textDecoration | none, underline | "none" |

### Border Properties
| Property | Example |
|----------|---------|
| border | "1px solid hsl(var(--border))" |
| borderWidth | "1px" |
| borderStyle | "solid" |
| borderRadius | "8px" or "50%" |
| borderTop/Right/Bottom/Left | "1px solid hsl(var(--border))" |

### Effect Properties
| Property | Example |
|----------|---------|
| boxShadow | "0 4px 12px rgba(0,0,0,0.1)" |
| opacity | "0.8" |
| filter | "blur(4px)" |
| backdropFilter | "blur(10px)" |
| transform | "scale(1.05)" or "translateY(-2px)" |
| transition | "all 0.2s ease" |

### Position Properties
| Property | Values | Example |
|----------|--------|---------|
| position | static, relative, absolute, fixed, sticky | "relative" |
| top/right/bottom/left | length values | "0" |
| zIndex | number | "10" |

### Overflow Properties
| Property | Values | Example |
|----------|--------|---------|
| overflow | visible, hidden, scroll, auto | "hidden" |
| overflowX/overflowY | visible, hidden, scroll, auto | "auto" |
`;
}

// Build complete AI context
export function buildAIContext(): string {
  return [
    generateComponentDocs(),
    generateColorPalettes(),
    generateDesignTokens(),
    generateSpacingGuidelines(),
    generateResponsiveGuidelines(),
    generateLayoutGuidelines(),
    generateCSSReference(),
    generatePrebuiltExamples(),
  ].join('\n\n');
}
