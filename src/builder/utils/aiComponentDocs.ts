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

// Generate industry-specific design systems
export function generateIndustryDesignSystems(): string {
  return `## Industry Design Systems (CRITICAL - Apply These Visual Languages)

### FASHION / APPAREL / LIFESTYLE ECOMMERCE
**Typography:**
- Headings: Georgia, "Playfair Display", serif - elegant, refined
- Body: Inter, system-ui - clean, readable
- Logo: Uppercase with 3-4px letter-spacing
- Heading sizes: 48-64px for main, 32-40px for sections

**Color Palette:**
- Background: #FAF9F7 (warm cream), #F5F5F4 (stone)
- Text: #1C1917 (stone-900), #78716C (stone-500)
- Accent: #B8860B (warm gold), #A16207 (amber)
- Badges: #C2410C (burnt orange) for "New", #059669 for "Sale"

**Product Card Style:**
- Clean white cards, minimal shadows
- Image ratio: 3:4 (portrait) for fashion - use aspectRatio: "3/4"
- Category label ABOVE product name (small, uppercase, muted, 11px, letter-spacing 1px)
- "New" badge: positioned top-left, colored background, white text, 11px font

**Navigation Style:**
- Logo: letterSpacing: "4px", fontFamily: "Georgia, serif", fontWeight: 400
- Links: 14px, color: #44403C, textTransform: "none"
- Icons: Search and Cart text or icons, 14px

---

### TECH / SAAS / STARTUP
**Typography:**
- Headings: Inter, system-ui - modern, geometric
- Use bold weights (700-800), tight line-height (1.1-1.2)

**Color Palette:**
- Primary: Indigo (#6366F1), Purple (#8B5CF6)
- Dark backgrounds: #0F172A, #1E293B
- Accent: Cyan (#06B6D4), Emerald (#10B981)
- Gradients: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)

**Card Style:**
- Rounded corners (12-16px), subtle shadows
- Dark cards on light bg, or glassmorphism on dark

---

### RESTAURANT / FOOD / HOSPITALITY
**Typography:**
- Headings: Georgia, "Playfair Display" - warm, inviting
- Body: system-ui

**Color Palette:**
- Warm: #78350F (amber-900), #92400E (warm brown)
- Accents: #EF4444 (red), #F97316 (orange)
- Background: #FFFBEB (warm cream), #1C1917 (dark)

**Menu Style:**
- Price in accent color (red or orange)
- Image thumbnails 80x80px with 8px border-radius

---

### LUXURY / PREMIUM / HIGH-END
**Typography:**
- Serif headings with extra letter-spacing (2-4px)
- Thin or light weights (300-400) with uppercase transforms
- Large headings (56-72px) with plenty of whitespace

**Color Palette:**
- Gold: #D4AF37, #B8860B
- Black: #18181B, #0F0F0F
- Cream: #FEFCE8, #FAF9F7

**Visual Elements:**
- Generous whitespace
- Minimal UI, let images breathe
- Subtle animations and transitions

---

### HEALTHCARE / MEDICAL / WELLNESS
**Typography:**
- Headings: Inter, system-ui - clean, trustworthy, professional
- Body: system-ui - highly readable
- Use medium weights (500-600) for headings, not too bold
- Heading sizes: 40-48px for main, 28-32px for sections

**Color Palette:**
- Primary: #0EA5E9 (sky-500), #0284C7 (sky-600) - calming, clinical
- Secondary: #14B8A6 (teal-500), #10B981 (emerald-500)
- Accent: #6366F1 (indigo) for CTAs
- Background: #F0F9FF (sky-50), #FFFFFF
- Trust colors: #059669 (green for positive), #3B82F6 (blue)
- Text: #0F172A (slate-900), #475569 (slate-600)

**Visual Elements:**
- Rounded corners (12-16px) for friendly feel
- Soft shadows, no harsh edges
- Trust badges and certifications prominent
- Clean iconography (medical symbols, checkmarks)
- Generous whitespace for readability

**Card Style:**
- White cards with subtle borders
- Icon at top (in colored circle)
- Clear, reassuring language

---

### EDUCATION / LEARNING / COURSES
**Typography:**
- Headings: Inter, system-ui - modern, approachable
- Body: system-ui with generous line-height (1.7)
- Use bold weights (600-700) for emphasis
- Heading sizes: 44-52px for main, 28-36px for sections

**Color Palette:**
- Primary: #3B82F6 (blue-500), #2563EB (blue-600) - knowledge, trust
- Secondary: #F59E0B (amber-500), #EAB308 (yellow-500) - energy, optimism
- Accent: #8B5CF6 (violet), #EC4899 (pink) for highlights
- Background: #FFFFFF, #FEF3C7 (amber-50), #F8FAFC
- Text: #1E293B (slate-800), #475569 (slate-600)

**Visual Elements:**
- Playful but professional
- Rounded corners (12px)
- Progress indicators and achievement badges
- Course cards with thumbnail, instructor, rating
- Category tags with bright colors

**Card Style:**
- Course thumbnail (16:9 ratio)
- Instructor avatar and name
- Star rating and student count
- Price or "Free" badge

---

### NONPROFIT / CHARITY / FOUNDATION
**Typography:**
- Headings: Georgia, serif OR Inter - warm, human
- Body: system-ui - accessible, readable
- Emotional headlines with medium weight (500)
- Heading sizes: 44-56px for impact statements

**Color Palette:**
- Primary: #059669 (emerald-600), #10B981 (emerald-500) - growth, hope
- Secondary: #F97316 (orange-500), #EAB308 (yellow-500) - warmth, urgency
- Accent: #EC4899 (pink) for donate CTAs
- Background: #FFFFFF, #F0FDF4 (green-50), #FEF3C7 (warm)
- Text: #1C1917 (stone-900), #57534E (stone-600)

**Visual Elements:**
- Emotional photography (people, impact)
- Impact statistics prominently displayed
- Progress bars for fundraising goals
- Donor testimonials with photos
- Clear, prominent "Donate" CTAs

**Card Style:**
- Cause/campaign cards with progress
- Impact numbers with icons
- Volunteer/team member cards

---

### WEDDING / EVENT / CELEBRATION
**Typography:**
- Headings: Georgia, "Playfair Display", serif - romantic, elegant
- Script fonts mentioned in descriptions (Parisienne feel)
- Body: system-ui - clean supporting text
- Heading sizes: 48-64px with loose letter-spacing (1-2px)

**Color Palette:**
- Primary: #F9A8D4 (pink-300), #FDA4AF (rose-300) - romantic
- Secondary: #D4AF37 (gold), #A16207 (amber-700)
- Accent: #4ADE80 (green for nature), #6366F1 (purple)
- Background: #FFFBEB (cream), #FFF1F2 (rose-50), #FFFFFF
- Text: #1C1917 (stone-900), #78716C (stone-500)

**Visual Elements:**
- Elegant serif typography
- Soft, romantic color palette
- Photo galleries with couples/venues
- Countdown timers
- RSVP forms
- Timeline/schedule visualization
- Floral and decorative accents

**Card Style:**
- Venue cards with large images
- Vendor cards with services and pricing
- Gallery with lightbox preview
`;
}

// Generate navigation style variations for diverse nav designs
export function generateNavigationStyles(): string {
  return `## Navigation Style Variations (CRITICAL - AVOID PREDICTABLE DESIGNS)

### PORTFOLIO / PERSONAL NAVIGATION STYLES
1. **Clean Minimal**: Name in UPPERCASE (letterSpacing: 3px) + right-aligned links (gap: 40px)
2. **Creative Bold**: Colored logo/name + links with hover underline animations
3. **Dark Header**: backgroundColor: #0F172A, white/gray text links
4. **Transparent Overlay**: backgroundColor: transparent, position: fixed over hero
5. **Name + Title**: "JOHN SMITH" + smaller "DEVELOPER" text stacked left, links right

### ECOMMERCE / FASHION NAVIGATION STYLES
1. **Classic Fashion**: Serif logo (Georgia) centered, links split left/right, icons far right
2. **Modern Minimal**: Sans-serif logo left, links center with flexGrow: 1, cart/search right
3. **Two-Row**: Top bar (free shipping promo) + main nav below
4. **Dark Luxe**: Dark background, gold or cream text, thin typography
5. **Mega Menu Ready**: Extra padding, hover states for dropdown menus

### SAAS / TECH NAVIGATION STYLES
1. **Standard**: Logo + 3-4 links + colored CTA button (backgroundColor: #6366F1)
2. **Docs-Style**: Logo + "Products" dropdown + "Docs" + "Sign In" + "Get Started" button
3. **Frosted Glass**: backdropFilter: blur(8px), semi-transparent background over gradient hero
4. **Dark Mode**: backgroundColor: #0F172A, light links, bright CTA
5. **Minimal**: Logo + 2 links + single CTA, lots of whitespace

### RESTAURANT / HOSPITALITY NAVIGATION STYLES
1. **Warm Elegant**: Serif logo, cream background, "Reserve" button in accent color
2. **Dark Moody**: Dark background, warm gold links, elegant typography
3. **Modern Bistro**: Clean sans-serif, minimal links, prominent booking CTA
4. **Split Design**: Logo centered, "Menu" left, "Reservations" right

### LUXURY / PREMIUM NAVIGATION STYLES
1. **Centered Logo**: Large logo centered, links below in row, extra letterSpacing (6-8px)
2. **Ultra Minimal**: Small logo left, 2-3 links right, fontWeight: 300
3. **Full Dark**: backgroundColor: #18181B, cream or gold text, uppercase links
4. **Stacked**: Logo on top centered, links in row below centered
5. **Invisible**: Transparent with position: fixed, only visible on scroll

### NAVIGATION VARIATION RULES
When generating navigation, NEVER repeat the same pattern. Vary:
- Logo treatment: all caps vs title case vs logo mark
- Link count: 3, 4, 5, or 6 links
- Link styling: plain, underline on hover, pill background on active
- Background: white, cream, dark, transparent, gradient
- Spacing: compact (gap: 24px) vs airy (gap: 48px)
- Typography: serif vs sans-serif vs mixed
`;
}


// Generate color palettes for vibrant designs
export function generateColorPalettes(): string {
  return `## Color Palettes for Dynamic Designs

### CRITICAL: Be Creative with Colors
DO NOT default to black/white/gray. Infer colors from context and create VIBRANT designs.

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
| Fashion/Beauty | #1C1917 (Stone-900) | #78716C (Stone-500) | #C2410C (Orange) | #FAF9F7, #18181B |
| Healthcare/Medical | #0EA5E9 (Sky) | #14B8A6 (Teal) | #6366F1 (Indigo) | #F0F9FF, #FFFFFF |
| Education/Learning | #3B82F6 (Blue) | #F59E0B (Amber) | #8B5CF6 (Violet) | #FFFFFF, #FEF3C7 |
| Nonprofit/Charity | #059669 (Emerald) | #F97316 (Orange) | #EC4899 (Pink) | #F0FDF4, #FFFBEB |
| Wedding/Event | #F9A8D4 (Pink) | #D4AF37 (Gold) | #6366F1 (Purple) | #FFFBEB, #FFF1F2 |

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

// Generate content density guidelines
export function generateContentGuidelines(): string {
  return `## Content Density Guidelines

### CRITICAL: Generate COMPLETE, REALISTIC Content

#### Section Content Minimums
| Section Type | Minimum | Recommended Content |
|-------------|---------|---------------------|
| Testimonials | 3 | 3-6 reviews with quote, name, role, company |
| Features | 4 | 4-6 features with icon, title, 15-25 word description |
| Pricing | 3 | 3 plans (Starter, Pro, Enterprise) with features list |
| Team | 4 | 4-6 members with name, role, bio |
| FAQ | 5 | 5-8 questions with detailed answers |
| Stats/Numbers | 4 | 4 stats with numbers and labels |
| Logos/Partners | 5 | 5-8 partner/client logos |

#### Testimonial Requirements
Each testimonial MUST include:
- **Quote**: 2-3 sentences (NOT generic like "Great product!")
- **Author**: Full name (e.g., "Sarah Chen")
- **Role & Company**: Specific title (e.g., "VP of Operations, TechFlow Inc.")

Example testimonial content:
"Since implementing this platform, our team productivity increased by 40%. The intuitive interface meant zero training time."
— Sarah Chen, VP of Operations at TechFlow Inc.

#### Feature Card Requirements
- **Title**: 2-4 descriptive words
- **Description**: 15-25 words explaining the BENEFIT, not just the feature
- **Visual**: Icon or colored accent

#### NEVER Generate:
- Single testimonial when section expects multiple
- Generic placeholder like "Lorem ipsum" or "Description here"
- Empty or one-sentence descriptions
- Repetitive/duplicate content across cards
`;
}

// Generate visual hierarchy guidelines
export function generateVisualHierarchyGuidelines(): string {
  return `## Visual Hierarchy & Section Backgrounds

### CRITICAL: Alternate Section Backgrounds for Readability

NEVER use the same background for consecutive sections. Create VISUAL RHYTHM.

### Section Background Pattern (Follow This Order)
| Section | Background | Text Color |
|---------|------------|------------|
| Hero | Gradient or Dark (#0F172A) | White (#FFFFFF) |
| Features | Light Gray (#F8FAFC) | Dark (#0F172A) |
| Testimonials | White (#FFFFFF) or Tinted (#F0F9FF) | Dark (#1E293B) |
| Stats/Social Proof | Subtle Color (#FEF3C7, #ECFDF5) | Dark |
| CTA | Bold Color or Gradient | White (#FFFFFF) |
| Footer | Dark (#18181B, #0F172A) | Light (#F8FAFC) |

### Alternating Pattern Examples
**Tech/SaaS Landing:**
1. Hero: linear-gradient(135deg, #6366F1, #8B5CF6) + white text
2. Features: #F8FAFC (light gray) + dark text
3. Testimonials: #FFFFFF + dark text  
4. Stats: #F0F9FF (light blue tint) + dark text
5. CTA: #6366F1 (solid) + white text
6. Footer: #0F172A (dark) + light text

**Restaurant/Food Landing:**
1. Hero: linear-gradient(135deg, #EF4444, #F97316) + white text
2. Menu: #FFFBEB (warm cream) + dark text
3. Reviews: #FFFFFF + dark text
4. About: #FEF2F2 (light red tint) + dark text
5. CTA: #EF4444 + white text
6. Footer: #1C1917 + light text

### Card Backgrounds Within Sections
| Section Background | Card Background | Card Shadow |
|-------------------|-----------------|-------------|
| White (#FFFFFF) | #FFFFFF | 0 4px 20px rgba(0,0,0,0.08) |
| Light Gray (#F8FAFC) | #FFFFFF | 0 2px 12px rgba(0,0,0,0.06) |
| Dark (#0F172A) | rgba(255,255,255,0.05) | none |
| Colored | #FFFFFF or rgba(255,255,255,0.95) | subtle |

### Text Contrast Rules (WCAG 4.5:1 minimum)
| Background | Primary Text | Secondary Text |
|------------|--------------|----------------|
| White/Light | #0F172A or #1E293B | #64748B |
| Dark | #FFFFFF | #94A3B8 |
| Colored/Gradient | #FFFFFF | rgba(255,255,255,0.85) |
`;
}


// Generate hero section guidelines
export function generateHeroGuidelines(): string {
  return `## Hero Section Guidelines (CRITICAL)

### Hero sections MUST be detailed and visually rich - NOT just heading + text + button

#### Required Elements (minimum 4):
| Element | Description | Example |
|---------|-------------|---------|
| Badge/Label | Small tag above headline | "✨ New Feature", "v2.0 Released", "Trusted by 10k+" |
| Headline (H1) | Main headline, 5-10 words | "Build Stunning Websites in Minutes" |
| Subheadline | Supporting text, 15-25 words | "Our drag-and-drop builder..." |
| CTA Buttons | 1-2 action buttons | "Get Started Free", "Watch Demo →" |

#### Recommended Additional Elements (include 2-3):
| Element | When to Include |
|---------|----------------|
| Hero Image/Screenshot | ALWAYS for product/SaaS sites |
| Stats Row | "10k+ users", "99.9% uptime", "4.9★ rating" |
| Trust Logos | SaaS, Enterprise, B2B sites |
| Social Proof | "Join 50,000+ professionals" |
| Feature Pills | Small tags showing key features |

#### Hero Layout Patterns

**1. Split Layout (RECOMMENDED for products):**
Left side: Badge → Headline → Subheadline → Buttons → Stats row
Right side: Product screenshot or illustration
Use: gridTemplateColumns: "1fr 1fr", gap: "48px"

**2. Centered Layout:**
Badge → Headline → Subheadline → Buttons (all centered)
Stats row or trust logos below
Hero image below content

#### Hero Image Requirements
- Product sites: Show dashboard, app UI, or interface screenshot
- Use Unsplash URLs for realistic images
- Add boxShadow and borderRadius for polish

#### Example Hero with Badge + Stats + Image
{
  "type": "Section",
  "styles": { "background": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", "padding": "100px 24px" },
  "children": [
    {
      "type": "Container",
      "styles": { "display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "48px", "alignItems": "center", "maxWidth": "1200px", "margin": "0 auto" },
      "responsiveStyles": { "mobile": { "gridTemplateColumns": "1fr" } },
      "children": [
        {
          "type": "Div",
          "styles": { "display": "flex", "flexDirection": "column", "gap": "24px" },
          "children": [
            { "type": "Div", "styles": { "display": "inline-flex", "backgroundColor": "rgba(255,255,255,0.2)", "padding": "8px 16px", "borderRadius": "999px", "width": "fit-content" }, 
              "children": [{ "type": "Text", "props": { "children": "✨ Now with AI Features" }, "styles": { "color": "#FFFFFF", "fontSize": "14px", "fontWeight": "500" }}]
            },
            { "type": "Heading", "props": { "children": "Build Websites 10x Faster", "level": "h1" }, "styles": { "color": "#FFFFFF", "fontSize": "56px", "fontWeight": "800", "lineHeight": "1.1" }},
            { "type": "Text", "props": { "children": "The visual builder that turns your ideas into production-ready websites in minutes, not weeks." }, "styles": { "color": "rgba(255,255,255,0.9)", "fontSize": "20px", "lineHeight": "1.6" }},
            { "type": "Div", "styles": { "display": "flex", "gap": "16px", "flexWrap": "wrap" },
              "children": [
                { "type": "Button", "props": { "children": "Start Free Trial" }, "styles": { "backgroundColor": "#FFFFFF", "color": "#6366F1", "padding": "16px 32px", "borderRadius": "8px", "fontWeight": "600" }},
                { "type": "Button", "props": { "children": "Watch Demo →" }, "styles": { "backgroundColor": "transparent", "color": "#FFFFFF", "border": "2px solid rgba(255,255,255,0.3)", "padding": "16px 32px", "borderRadius": "8px" }}
              ]
            },
            { "type": "Div", "styles": { "display": "flex", "gap": "32px", "marginTop": "16px" },
              "children": [
                { "type": "Div", "children": [
                  { "type": "Text", "props": { "children": "10,000+" }, "styles": { "color": "#FFFFFF", "fontSize": "24px", "fontWeight": "700" }},
                  { "type": "Text", "props": { "children": "Active Users" }, "styles": { "color": "rgba(255,255,255,0.7)", "fontSize": "14px" }}
                ]},
                { "type": "Div", "children": [
                  { "type": "Text", "props": { "children": "99.9%" }, "styles": { "color": "#FFFFFF", "fontSize": "24px", "fontWeight": "700" }},
                  { "type": "Text", "props": { "children": "Uptime" }, "styles": { "color": "rgba(255,255,255,0.7)", "fontSize": "14px" }}
                ]},
                { "type": "Div", "children": [
                  { "type": "Text", "props": { "children": "4.9★" }, "styles": { "color": "#FFFFFF", "fontSize": "24px", "fontWeight": "700" }},
                  { "type": "Text", "props": { "children": "Rating" }, "styles": { "color": "rgba(255,255,255,0.7)", "fontSize": "14px" }}
                ]}
              ]
            }
          ]
        },
        {
          "type": "Image",
          "props": { "src": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop", "alt": "Product Dashboard" },
          "styles": { "width": "100%", "borderRadius": "16px", "boxShadow": "0 25px 50px rgba(0,0,0,0.25)" }
        }
      ]
    }
  ]
}
`;
}

// Generate image guidelines for profile pics and hero images
export function generateImageGuidelines(): string {
  return `## Auto-Generated Images (CRITICAL)

### ALWAYS Include Images in These Sections:
| Section | Image Type | Required |
|---------|------------|----------|
| Testimonials | Profile photos | YES - one per review |
| Team | Team member photos | YES - one per member |
| Hero | Product screenshot/illustration | YES for product sites |
| About | Company/team photos | Recommended |

### Profile Image URLs (Use These for Testimonials & Team)
Diverse, high-quality Unsplash profile photos:

**Women:**
- https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face

**Men:**
- https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face
- https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face

### Hero/Product Image URLs
- https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop (dashboard)
- https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop (analytics)
- https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop (coding)
- https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop (tech)

### Industry-Specific Image URLs

**Fashion/Apparel Products (Use 3:4 ratio for portrait):**
- Linen shirt: https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=533&fit=crop
- Blazer: https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop
- Trousers: https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=533&fit=crop
- Sweater: https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=533&fit=crop
- Coat: https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=533&fit=crop
- Dress: https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop
- Handbag: https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=533&fit=crop
- Accessories: https://images.unsplash.com/photo-1611923134239-b9be5816a2d0?w=400&h=533&fit=crop
- Model lifestyle: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop
- Knit sweater: https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=533&fit=crop

**Tech/Ecommerce Products (1:1 ratio):**
- Watch: https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop
- Headphones: https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop
- Shoes: https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop
- Camera: https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop
- Skincare: https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop
- Bag: https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop
- Sunglasses: https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop

**Restaurant/Food:**
- Salad: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop
- Pizza: https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop
- Pancakes: https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop
- Bowl: https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop
- Steak: https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=400&fit=crop
- Burger: https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop
- Restaurant interior: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop

**Fitness/Gym:**
- Gym: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop
- Yoga: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop
- Training: https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop
- Workout: https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop

**Real Estate:**
- House exterior: https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop
- Apartment: https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop
- Modern home: https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop
- Luxury home: https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop

**Healthcare/Medical:**
- Doctor female: https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face
- Doctor male: https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face
- Medical team: https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop
- Clinic interior: https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop
- Patient care: https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop
- Medical equipment: https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop
- Stethoscope: https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&h=400&fit=crop
- Healthcare reception: https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop

**Education/Learning:**
- Students learning: https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop
- Online course: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop
- Classroom: https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop
- Laptop study: https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop
- Instructor female: https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face
- Instructor male: https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face
- Books: https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop
- Graduation: https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop

**Nonprofit/Charity:**
- Volunteers: https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&h=600&fit=crop
- Community help: https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop
- Children education: https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop
- Food donation: https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop
- Hands helping: https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop
- Charity event: https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop
- Team volunteering: https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=600&fit=crop

**Wedding/Event:**
- Couple portrait: https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop
- Wedding venue: https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop
- Wedding flowers: https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop
- Ceremony: https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop
- Reception: https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop
- Rings: https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=400&fit=crop
- Wedding cake: https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=400&fit=crop
- Table setting: https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=600&fit=crop

### Example Testimonial WITH Profile Image
{
  "type": "Div",
  "styles": { "backgroundColor": "#FFFFFF", "padding": "32px", "borderRadius": "16px", "boxShadow": "0 4px 20px rgba(0,0,0,0.08)" },
  "children": [
    { "type": "Image", 
      "props": { "src": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", "alt": "Sarah Chen" },
      "styles": { "width": "64px", "height": "64px", "borderRadius": "50%", "marginBottom": "16px", "objectFit": "cover" }
    },
    { "type": "Text", "props": { "children": "Since implementing this platform, our team productivity increased by 40%. The intuitive interface meant zero training time." }, "styles": { "fontSize": "16px", "lineHeight": "1.7", "color": "#334155", "marginBottom": "16px" }},
    { "type": "Text", "props": { "children": "Sarah Chen" }, "styles": { "fontWeight": "600", "color": "#0F172A" }},
    { "type": "Text", "props": { "children": "VP of Operations, TechFlow" }, "styles": { "fontSize": "14px", "color": "#64748B" }}
  ]
}

### Image Styling Rules
- Profile photos: width/height 48-80px, borderRadius: 50%, objectFit: cover
- Hero images: width: 100%, borderRadius: 12-16px, boxShadow for depth
- Fashion products: aspectRatio: "3/4" (portrait)
- Tech products: aspectRatio: "1" (square)
- Always include meaningful alt text
`;
}

// Generate industry-specific page blueprints
export function generateIndustryBlueprints(): string {
  return `## Industry Page Blueprints (CRITICAL - Follow These Exactly)

### SITE TYPE DETECTION
When user requests a page, IDENTIFY the site type and follow its blueprint:

| Keywords | Site Type | Blueprint to Follow |
|----------|-----------|---------------------|
| "ecommerce", "store", "shop", "products", "buy", "cart" | ECOMMERCE | Product grids, categories, cart |
| "restaurant", "food", "menu", "cafe", "dining", "bistro" | RESTAURANT | Menu, reservations, hours |
| "fitness", "gym", "workout", "training", "yoga" | FITNESS | Classes, trainers, membership |
| "real estate", "property", "homes", "listings", "realtor" | REAL ESTATE | Property cards, search, agents |
| "saas", "software", "app", "platform", "tool", "dashboard" | SAAS | Features, pricing, integrations |
| "agency", "studio", "creative", "design", "marketing" | AGENCY | Portfolio, services, process |
| "portfolio", "personal", "freelance", "resume", "developer" | PORTFOLIO | Projects, skills, about, contact |
| "healthcare", "medical", "clinic", "doctor", "hospital", "wellness" | HEALTHCARE | Services, doctors, appointments |
| "education", "school", "course", "learning", "university", "training" | EDUCATION | Courses, instructors, enrollment |
| "nonprofit", "charity", "foundation", "donate", "ngo", "cause" | NONPROFIT | Impact, donate, volunteer |
| "wedding", "event", "party", "celebration", "planner" | WEDDING/EVENT | Gallery, RSVP, timeline |

FOLLOW THE INDUSTRY BLUEPRINT - include ALL required sections.
Do NOT create shallow pages with just hero + features + CTA.

---

### ECOMMERCE / ONLINE STORE (Fashion/Apparel Style)
Required Sections (in order):
1. **Navigation**: 
   - Logo (uppercase, letterSpacing: 4px, serif font for fashion)
   - 3-4 links (New Arrivals, Collections, About)
   - Search + Cart icons/text with count
   - Background: #FAF9F7, borderBottom: 1px solid #E7E5E4
   
2. **Hero** (Split Layout):
   - Left: Collection badge (uppercase, 12px, letter-spacing) → Serif headline (48-56px) → Description → 2 CTAs (filled + outlined)
   - Right: Featured product/collection image with overlay showing featured item name + price
   - Background: #FAF9F7 (cream)
   
3. **Featured Products Section**:
   - Header with subtitle + "View All Products" link
   - **MINIMUM 8 products** in 4-column grid
   - Each product card: Image (3:4 ratio) → "New" badge on 2-3 items → Category label (TOPS, BOTTOMS, etc.) → Name → Price
   
4. **Categories**: 4-6 category cards with images
5. **Trust Bar**: Free shipping, easy returns, quality guarantee
6. **Newsletter**: Email signup with discount incentive ("10% off your first order")
7. **Footer**: Multi-column links, social icons, payment badges

**CRITICAL Fashion Ecommerce Rules:**
- Use serif fonts (Georgia, Playfair Display) for headings
- Warm cream backgrounds (#FAF9F7, #F5F5F4)
- Muted stone colors for text (#1C1917, #78716C)
- Product images MUST be 3:4 aspect ratio (portrait)
- Show category labels ABOVE product name (11px, uppercase, letter-spacing: 1px)
- Include "New" badge with background #C2410C on 2-3 products

**Complete Fashion Navigation Example:**
\`\`\`json
{
  "type": "Section", "label": "Navigation",
  "styles": { "backgroundColor": "#FAF9F7", "padding": "20px 24px", "borderBottom": "1px solid #E7E5E4" },
  "children": [{
    "type": "Container",
    "styles": { "maxWidth": "1280px", "margin": "0 auto", "display": "flex", "justifyContent": "space-between", "alignItems": "center" },
    "children": [
      { "type": "Heading", "props": { "children": "MAISON", "level": "h3" }, "styles": { "fontSize": "24px", "fontWeight": "400", "letterSpacing": "4px", "fontFamily": "Georgia, serif", "color": "#1C1917" }},
      { "type": "Div", "styles": { "display": "flex", "gap": "40px" }, "children": [
        { "type": "Link", "props": { "children": "New Arrivals", "href": "#" }, "styles": { "color": "#44403C", "fontSize": "14px", "textDecoration": "none" }},
        { "type": "Link", "props": { "children": "Collections", "href": "#" }, "styles": { "color": "#44403C", "fontSize": "14px", "textDecoration": "none" }},
        { "type": "Link", "props": { "children": "About", "href": "#" }, "styles": { "color": "#44403C", "fontSize": "14px", "textDecoration": "none" }}
      ]},
      { "type": "Div", "styles": { "display": "flex", "gap": "24px", "alignItems": "center" }, "children": [
        { "type": "Text", "props": { "children": "Search" }, "styles": { "fontSize": "14px", "color": "#44403C" }},
        { "type": "Text", "props": { "children": "Cart (2)" }, "styles": { "fontSize": "14px", "color": "#44403C" }}
      ]}
    ]
  }]
}
\`\`\`

**Complete Fashion Hero Example:**
\`\`\`json
{
  "type": "Section", "label": "Hero",
  "styles": { "backgroundColor": "#FAF9F7", "padding": "80px 24px" },
  "children": [{
    "type": "Container",
    "styles": { "maxWidth": "1280px", "margin": "0 auto", "display": "grid", "gridTemplateColumns": "1fr 1fr", "gap": "64px", "alignItems": "center" },
    "responsiveStyles": { "mobile": { "gridTemplateColumns": "1fr" } },
    "children": [
      { "type": "Div", "styles": { "display": "flex", "flexDirection": "column", "gap": "24px" }, "children": [
        { "type": "Text", "props": { "children": "SPRING COLLECTION 2024" }, "styles": { "fontSize": "12px", "letterSpacing": "3px", "color": "#A8A29E" }},
        { "type": "Heading", "props": { "children": "Effortless Elegance for Every Day", "level": "h1" }, "styles": { "fontSize": "56px", "fontWeight": "400", "fontFamily": "Georgia, serif", "color": "#1C1917", "lineHeight": "1.1" }},
        { "type": "Text", "props": { "children": "Discover timeless pieces crafted with care. Designed to transition seamlessly from morning to evening." }, "styles": { "fontSize": "16px", "color": "#78716C", "lineHeight": "1.6" }},
        { "type": "Div", "styles": { "display": "flex", "gap": "16px", "marginTop": "16px" }, "children": [
          { "type": "Button", "props": { "children": "Shop Collection" }, "styles": { "backgroundColor": "#1C1917", "color": "#FFFFFF", "padding": "16px 32px", "borderRadius": "0", "border": "none", "fontSize": "14px" }},
          { "type": "Button", "props": { "children": "View Lookbook" }, "styles": { "backgroundColor": "transparent", "color": "#1C1917", "padding": "16px 32px", "border": "1px solid #1C1917", "borderRadius": "0", "fontSize": "14px" }}
        ]}
      ]},
      { "type": "Div", "styles": { "position": "relative" }, "children": [
        { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop", "alt": "Featured collection" }, "styles": { "width": "100%", "borderRadius": "0" }},
        { "type": "Div", "styles": { "position": "absolute", "bottom": "24px", "left": "24px", "right": "24px", "backgroundColor": "#FFFFFF", "padding": "20px" }, "children": [
          { "type": "Text", "props": { "children": "Featured: The Linen Blazer" }, "styles": { "fontWeight": "500", "color": "#1C1917" }},
          { "type": "Text", "props": { "children": "$199" }, "styles": { "fontSize": "14px", "color": "#78716C" }}
        ]}
      ]}
    ]
  }]
}
\`\`\`

**Fashion Product Card Example (with New badge):**
\`\`\`json
{
  "type": "Div", "styles": { "display": "flex", "flexDirection": "column" },
  "children": [
    { "type": "Div", "styles": { "position": "relative" }, "children": [
      { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=533&fit=crop", "alt": "Relaxed Linen Shirt" }, "styles": { "width": "100%", "aspectRatio": "3/4", "objectFit": "cover" }},
      { "type": "Div", "styles": { "position": "absolute", "top": "12px", "left": "12px", "backgroundColor": "#C2410C", "padding": "6px 12px" }, "children": [
        { "type": "Text", "props": { "children": "New" }, "styles": { "color": "#FFFFFF", "fontSize": "11px", "fontWeight": "500" }}
      ]}
    ]},
    { "type": "Text", "props": { "children": "TOPS" }, "styles": { "fontSize": "11px", "letterSpacing": "1px", "color": "#A8A29E", "marginTop": "16px" }},
    { "type": "Text", "props": { "children": "Relaxed Linen Shirt" }, "styles": { "fontSize": "15px", "color": "#1C1917", "marginTop": "4px" }},
    { "type": "Text", "props": { "children": "$98" }, "styles": { "fontSize": "14px", "color": "#78716C", "marginTop": "4px" }}
  ]
}
\`\`\`

---

### RESTAURANT / FOOD
Required Sections:
1. **Hero**: Restaurant ambiance image, tagline, "Reserve a Table" + "View Menu" CTAs
2. **About/Story**: Chef photo or interior, restaurant story, signature dishes mention
3. **Menu Highlights**: 6-8 dishes with image, name, description, price
4. **Full Menu Categories**: Categorized menu (Starters, Mains, Desserts, Drinks)
5. **Reviews**: 3-4 customer reviews with food mentions
6. **Location & Hours**: Address, map reference, opening hours, phone
7. **Reservation CTA**: Form or prominent button to book
8. **Footer**: Social links, contact

**Menu Item Structure:**
\`\`\`json
{
  "type": "Div", "styles": { "display": "flex", "gap": "16px", "padding": "16px", "borderBottom": "1px solid #E2E8F0" },
  "children": [
    { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=400&fit=crop", "alt": "Grilled Salmon" }, "styles": { "width": "80px", "height": "80px", "borderRadius": "8px", "objectFit": "cover" }},
    { "type": "Div", "styles": { "flex": "1" }, "children": [
      { "type": "Div", "styles": { "display": "flex", "justifyContent": "space-between" }, "children": [
        { "type": "Text", "props": { "children": "Grilled Salmon" }, "styles": { "fontWeight": "600", "fontSize": "16px", "color": "#0F172A" }},
        { "type": "Text", "props": { "children": "$28" }, "styles": { "fontWeight": "700", "color": "#EF4444" }}
      ]},
      { "type": "Text", "props": { "children": "Fresh Atlantic salmon with herbs, lemon butter sauce, and seasonal vegetables" }, "styles": { "color": "#64748B", "fontSize": "14px", "marginTop": "4px" }}
    ]}
  ]
}
\`\`\`

---

### FITNESS / GYM
Required Sections:
1. **Hero**: Energetic gym image, motivational headline, "Start Free Trial" CTA
2. **Classes Grid**: 6 class types with images (Yoga, HIIT, Spin, Strength, etc.)
3. **Membership Plans**: 3 pricing tiers with features list
4. **Trainers**: 4 trainer cards with photo, name, specialty, certifications
5. **Facility Gallery**: 4-6 gym/studio photos in grid
6. **Success Stories**: Member testimonials or transformation stories
7. **Location & Schedule**: Address, class schedule preview
8. **CTA**: Free trial or membership signup

**Class Card Structure:**
\`\`\`json
{
  "type": "Div", "styles": { "position": "relative", "borderRadius": "16px", "overflow": "hidden" },
  "children": [
    { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop", "alt": "Yoga Class" }, "styles": { "width": "100%", "height": "200px", "objectFit": "cover" }},
    { "type": "Div", "styles": { "position": "absolute", "bottom": "0", "left": "0", "right": "0", "padding": "16px", "background": "linear-gradient(transparent, rgba(0,0,0,0.8))" }, "children": [
      { "type": "Text", "props": { "children": "Yoga Flow" }, "styles": { "color": "#FFFFFF", "fontWeight": "600", "fontSize": "18px" }},
      { "type": "Text", "props": { "children": "Mon, Wed, Fri • 7:00 AM" }, "styles": { "color": "rgba(255,255,255,0.8)", "fontSize": "14px" }}
    ]}
  ]
}
\`\`\`

---

### REAL ESTATE / PROPERTY
Required Sections:
1. **Hero**: Search interface, property types (Buy/Rent/Sell), featured listing
2. **Featured Listings**: 4-6 property cards with image, price, beds/baths, sqft, location
3. **Property Types**: Categories (Apartments, Houses, Condos, Commercial)
4. **Why Choose Us**: Agent expertise, local knowledge, success stats
5. **Testimonials**: Client success stories
6. **Agents**: Team photos with contact info
7. **Contact Form**: Property inquiry form

**Property Card Structure:**
\`\`\`json
{
  "type": "Div", "styles": { "backgroundColor": "#FFFFFF", "borderRadius": "16px", "overflow": "hidden", "boxShadow": "0 4px 20px rgba(0,0,0,0.08)" },
  "children": [
    { "type": "Div", "styles": { "position": "relative" }, "children": [
      { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop", "alt": "Modern Home" }, "styles": { "width": "100%", "height": "200px", "objectFit": "cover" }},
      { "type": "Div", "styles": { "position": "absolute", "top": "12px", "left": "12px", "backgroundColor": "#10B981", "padding": "6px 12px", "borderRadius": "6px" }, "children": [
        { "type": "Text", "props": { "children": "For Sale" }, "styles": { "color": "#FFFFFF", "fontSize": "12px", "fontWeight": "600" }}
      ]}
    ]},
    { "type": "Div", "styles": { "padding": "20px" }, "children": [
      { "type": "Text", "props": { "children": "$850,000" }, "styles": { "fontSize": "24px", "fontWeight": "700", "color": "#0F172A" }},
      { "type": "Text", "props": { "children": "Modern Family Home" }, "styles": { "fontSize": "16px", "fontWeight": "500", "color": "#334155", "marginTop": "4px" }},
      { "type": "Text", "props": { "children": "123 Oak Street, Beverly Hills" }, "styles": { "fontSize": "14px", "color": "#64748B", "marginTop": "4px" }},
      { "type": "Div", "styles": { "display": "flex", "gap": "16px", "marginTop": "16px", "paddingTop": "16px", "borderTop": "1px solid #E2E8F0" }, "children": [
        { "type": "Text", "props": { "children": "🛏 4 Beds" }, "styles": { "fontSize": "14px", "color": "#64748B" }},
        { "type": "Text", "props": { "children": "🛁 3 Baths" }, "styles": { "fontSize": "14px", "color": "#64748B" }},
        { "type": "Text", "props": { "children": "📐 2,500 sqft" }, "styles": { "fontSize": "14px", "color": "#64748B" }}
      ]}
    ]}
  ]
}
\`\`\`

---

### SAAS / SOFTWARE
Required Sections:
1. **Hero**: Product screenshot, badge, headline, 2 CTAs, stats row
2. **Logos/Trust Bar**: "Trusted by" with company logos
3. **Features Grid**: 6 features with icons and descriptions
4. **How It Works**: 3-step process visualization
5. **Pricing**: 3 tiers (Starter, Pro, Enterprise) with feature lists
6. **Testimonials**: 3 reviews with company logos
7. **FAQ**: 5-6 common questions with answers
8. **CTA**: Final signup push
9. **Footer**: Links, legal, social

---

### AGENCY / CREATIVE
Required Sections:
1. **Hero**: Bold statement, portfolio preview thumbnails, "View Work" CTA
2. **Services**: 4-6 services offered with descriptions
3. **Selected Work**: 4-6 case study cards with project images
4. **Process**: How you work (Discovery → Design → Develop → Launch)
5. **Clients**: Logo bar of past clients
6. **Team**: Team member photos and roles
7. **Contact**: Contact form or booking link

---

### PORTFOLIO / PERSONAL
Required Sections:
1. **Hero**: Name, title, photo, tagline, contact CTA
2. **About**: Personal story, background, approach
3. **Skills**: Technology stack or expertise areas
4. **Projects**: 4-6 project cards with images and descriptions
5. **Experience**: Work history timeline
6. **Testimonials**: Client or colleague reviews
7. **Contact**: Contact form with social links

---

### HEALTHCARE / MEDICAL / CLINIC
Required Sections:
1. **Navigation**: Logo, Services dropdown, About, Contact, "Book Appointment" CTA button (sky-500 bg)
2. **Hero**: 
   - Reassuring headline ("Caring for You and Your Family")
   - Professional image of medical staff or clinic
   - Two CTAs: "Book Appointment" + "Our Services"
   - Trust badges (certifications, ratings)
   - Background: #F0F9FF (sky-50) or white
3. **Services Grid**: 6 medical services with icon, name, description
4. **Why Choose Us**: 3-4 trust factors (Experience, Certified Doctors, Modern Technology, Personalized Care)
5. **Doctors/Team**: 4 doctor cards with photo, name, specialty, credentials
6. **Testimonials**: 3-4 patient reviews
7. **Insurance/Partners**: Logo bar of accepted insurance providers
8. **Location & Hours**: Address, map reference, hours, emergency contact
9. **CTA**: Appointment booking section
10. **Footer**: Contact info, services links, emergency numbers

**Doctor Card Example:**
\`\`\`json
{
  "type": "Div", "styles": { "backgroundColor": "#FFFFFF", "borderRadius": "16px", "padding": "24px", "textAlign": "center", "border": "1px solid #E2E8F0" },
  "children": [
    { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face", "alt": "Dr. Sarah Johnson" }, "styles": { "width": "120px", "height": "120px", "borderRadius": "50%", "objectFit": "cover", "margin": "0 auto 16px" }},
    { "type": "Text", "props": { "children": "Dr. Sarah Johnson" }, "styles": { "fontWeight": "600", "fontSize": "18px", "color": "#0F172A" }},
    { "type": "Text", "props": { "children": "Cardiologist" }, "styles": { "color": "#0EA5E9", "fontSize": "14px", "fontWeight": "500", "marginTop": "4px" }},
    { "type": "Text", "props": { "children": "MD, FACC • 15+ Years Experience" }, "styles": { "color": "#64748B", "fontSize": "14px", "marginTop": "8px" }},
    { "type": "Button", "props": { "children": "Book Appointment" }, "styles": { "marginTop": "16px", "backgroundColor": "#0EA5E9", "color": "#FFFFFF", "padding": "10px 20px", "borderRadius": "8px", "border": "none", "fontSize": "14px" }}
  ]
}
\`\`\`

**Healthcare Service Card Example:**
\`\`\`json
{
  "type": "Div", "styles": { "backgroundColor": "#FFFFFF", "borderRadius": "16px", "padding": "32px", "textAlign": "center", "border": "1px solid #E2E8F0" },
  "children": [
    { "type": "Div", "styles": { "width": "64px", "height": "64px", "borderRadius": "50%", "backgroundColor": "#F0F9FF", "display": "flex", "alignItems": "center", "justifyContent": "center", "margin": "0 auto 16px" }, "children": [
      { "type": "Text", "props": { "children": "🫀" }, "styles": { "fontSize": "28px" }}
    ]},
    { "type": "Text", "props": { "children": "Cardiology" }, "styles": { "fontWeight": "600", "fontSize": "18px", "color": "#0F172A", "marginBottom": "8px" }},
    { "type": "Text", "props": { "children": "Comprehensive heart care including diagnostics, treatment, and preventive cardiology services." }, "styles": { "color": "#64748B", "fontSize": "14px", "lineHeight": "1.6" }}
  ]
}
\`\`\`

---

### EDUCATION / LEARNING / COURSES
Required Sections:
1. **Navigation**: Logo, Courses dropdown, Instructors, Pricing, "Start Learning" CTA (blue-500 bg)
2. **Hero**:
   - Empowering headline ("Master New Skills, Transform Your Career")
   - Student/learning imagery or illustration
   - Search bar for courses (optional)
   - Stats: Students enrolled, Courses available, Expert instructors
   - Background: #FFFFFF or #F8FAFC
3. **Featured Courses**: 6-8 course cards with thumbnail, title, instructor, rating, price
4. **Categories**: 6 category cards (Development, Design, Business, Marketing, Photography, Music)
5. **How It Works**: 3-step process (Browse Courses → Enroll & Learn → Get Certified)
6. **Instructors**: 4 instructor cards with photo, name, expertise, course count
7. **Testimonials**: 3 student success stories
8. **Pricing/Plans**: Free vs Pro membership comparison (optional)
9. **CTA**: Start learning or browse courses
10. **Footer**: Course categories, support links, legal

**Course Card Example:**
\`\`\`json
{
  "type": "Div", "styles": { "backgroundColor": "#FFFFFF", "borderRadius": "12px", "overflow": "hidden", "boxShadow": "0 4px 12px rgba(0,0,0,0.08)" },
  "children": [
    { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop", "alt": "Web Development Course" }, "styles": { "width": "100%", "height": "160px", "objectFit": "cover" }},
    { "type": "Div", "styles": { "padding": "16px" }, "children": [
      { "type": "Div", "styles": { "display": "flex", "gap": "8px", "marginBottom": "8px" }, "children": [
        { "type": "Text", "props": { "children": "Development" }, "styles": { "fontSize": "11px", "backgroundColor": "#DBEAFE", "color": "#2563EB", "padding": "4px 8px", "borderRadius": "4px", "fontWeight": "500" }},
        { "type": "Text", "props": { "children": "Bestseller" }, "styles": { "fontSize": "11px", "backgroundColor": "#FEF3C7", "color": "#D97706", "padding": "4px 8px", "borderRadius": "4px", "fontWeight": "500" }}
      ]},
      { "type": "Text", "props": { "children": "Complete Web Development Bootcamp" }, "styles": { "fontWeight": "600", "fontSize": "16px", "color": "#0F172A", "marginBottom": "8px" }},
      { "type": "Div", "styles": { "display": "flex", "alignItems": "center", "gap": "8px", "marginBottom": "12px" }, "children": [
        { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face", "alt": "John Smith" }, "styles": { "width": "24px", "height": "24px", "borderRadius": "50%", "objectFit": "cover" }},
        { "type": "Text", "props": { "children": "John Smith" }, "styles": { "fontSize": "13px", "color": "#64748B" }}
      ]},
      { "type": "Div", "styles": { "display": "flex", "justifyContent": "space-between", "alignItems": "center" }, "children": [
        { "type": "Div", "styles": { "display": "flex", "alignItems": "center", "gap": "4px" }, "children": [
          { "type": "Text", "props": { "children": "★ 4.8" }, "styles": { "color": "#F59E0B", "fontSize": "14px", "fontWeight": "600" }},
          { "type": "Text", "props": { "children": "(2.4k)" }, "styles": { "color": "#94A3B8", "fontSize": "13px" }}
        ]},
        { "type": "Text", "props": { "children": "$49.99" }, "styles": { "fontWeight": "700", "fontSize": "18px", "color": "#0F172A" }}
      ]}
    ]}
  ]
}
\`\`\`

---

### NONPROFIT / CHARITY / FOUNDATION
Required Sections:
1. **Navigation**: Logo, About, Programs, Impact, Get Involved, "Donate" CTA (prominent, pink/emerald bg)
2. **Hero**:
   - Emotional, impact-focused headline ("Together, We Can End Hunger")
   - Powerful imagery of people being helped
   - Primary "Donate Now" + Secondary "Learn More" CTAs
   - Quick stats: Lives Impacted, Funds Raised, Active Volunteers
   - Background: #FFFFFF or emerald gradient
3. **Mission Statement**: What we do, why it matters, our vision
4. **Programs/Causes**: 3-4 program cards with image, description, "Learn More" link
5. **Impact Numbers**: Large statistics section with icons (meals served, families helped, etc.)
6. **How to Help**: Donate, Volunteer, Fundraise, Share options
7. **Stories/Testimonials**: 2-3 impact stories with photos of real beneficiaries
8. **Partners/Sponsors**: Logo bar of corporate supporters
9. **Donate CTA**: Final prominent donation section with suggested amounts ($25, $50, $100, Custom)
10. **Footer**: Contact, programs, transparency/financial reports links

**Impact Stats Section Example:**
\`\`\`json
{
  "type": "Section", "styles": { "backgroundColor": "#059669", "padding": "64px 24px" },
  "children": [{
    "type": "Container", "styles": { "maxWidth": "1200px", "margin": "0 auto" },
    "children": [{
      "type": "Div", "styles": { "display": "grid", "gridTemplateColumns": "repeat(4, 1fr)", "gap": "32px", "textAlign": "center" },
      "responsiveStyles": { "mobile": { "gridTemplateColumns": "repeat(2, 1fr)" } },
      "children": [
        { "type": "Div", "children": [
          { "type": "Text", "props": { "children": "1M+" }, "styles": { "fontSize": "48px", "fontWeight": "700", "color": "#FFFFFF" }},
          { "type": "Text", "props": { "children": "Meals Served" }, "styles": { "fontSize": "16px", "color": "rgba(255,255,255,0.9)", "marginTop": "8px" }}
        ]},
        { "type": "Div", "children": [
          { "type": "Text", "props": { "children": "50K+" }, "styles": { "fontSize": "48px", "fontWeight": "700", "color": "#FFFFFF" }},
          { "type": "Text", "props": { "children": "Families Helped" }, "styles": { "fontSize": "16px", "color": "rgba(255,255,255,0.9)", "marginTop": "8px" }}
        ]},
        { "type": "Div", "children": [
          { "type": "Text", "props": { "children": "200+" }, "styles": { "fontSize": "48px", "fontWeight": "700", "color": "#FFFFFF" }},
          { "type": "Text", "props": { "children": "Communities" }, "styles": { "fontSize": "16px", "color": "rgba(255,255,255,0.9)", "marginTop": "8px" }}
        ]},
        { "type": "Div", "children": [
          { "type": "Text", "props": { "children": "$10M" }, "styles": { "fontSize": "48px", "fontWeight": "700", "color": "#FFFFFF" }},
          { "type": "Text", "props": { "children": "Funds Raised" }, "styles": { "fontSize": "16px", "color": "rgba(255,255,255,0.9)", "marginTop": "8px" }}
        ]}
      ]
    }]
  }]
}
\`\`\`

**Donate CTA Section Example:**
\`\`\`json
{
  "type": "Section", "styles": { "backgroundColor": "#F0FDF4", "padding": "80px 24px" },
  "children": [{
    "type": "Container", "styles": { "maxWidth": "600px", "margin": "0 auto", "textAlign": "center" },
    "children": [
      { "type": "Heading", "props": { "children": "Make a Difference Today", "level": "h2" }, "styles": { "fontSize": "40px", "fontWeight": "700", "color": "#0F172A", "marginBottom": "16px" }},
      { "type": "Text", "props": { "children": "Your donation helps provide food, shelter, and education to those in need." }, "styles": { "fontSize": "18px", "color": "#475569", "marginBottom": "32px" }},
      { "type": "Div", "styles": { "display": "flex", "gap": "12px", "justifyContent": "center", "flexWrap": "wrap", "marginBottom": "24px" }, "children": [
        { "type": "Button", "props": { "children": "$25" }, "styles": { "padding": "16px 32px", "border": "2px solid #059669", "backgroundColor": "transparent", "color": "#059669", "borderRadius": "8px", "fontSize": "18px", "fontWeight": "600" }},
        { "type": "Button", "props": { "children": "$50" }, "styles": { "padding": "16px 32px", "border": "2px solid #059669", "backgroundColor": "#059669", "color": "#FFFFFF", "borderRadius": "8px", "fontSize": "18px", "fontWeight": "600" }},
        { "type": "Button", "props": { "children": "$100" }, "styles": { "padding": "16px 32px", "border": "2px solid #059669", "backgroundColor": "transparent", "color": "#059669", "borderRadius": "8px", "fontSize": "18px", "fontWeight": "600" }},
        { "type": "Button", "props": { "children": "Custom" }, "styles": { "padding": "16px 32px", "border": "2px solid #059669", "backgroundColor": "transparent", "color": "#059669", "borderRadius": "8px", "fontSize": "18px", "fontWeight": "600" }}
      ]},
      { "type": "Button", "props": { "children": "Donate Now" }, "styles": { "padding": "18px 48px", "backgroundColor": "#EC4899", "color": "#FFFFFF", "borderRadius": "8px", "border": "none", "fontSize": "18px", "fontWeight": "600" }}
    ]
  }]
}
\`\`\`

---

### WEDDING / EVENT / CELEBRATION
Required Sections (for Wedding Website):
1. **Navigation**: Couple names or monogram, Our Story, Gallery, RSVP, Registry, Accommodations
2. **Hero**:
   - Couple names in elegant serif font (48-64px, letterSpacing: 2px)
   - Wedding date prominently displayed
   - Beautiful couple photo or venue image
   - "RSVP Now" CTA
   - Optional: Countdown timer to event
   - Background: #FFFBEB (cream) or #FFF1F2 (rose-50)
3. **Our Story**: How we met, relationship timeline, proposal story
4. **Event Details**: Ceremony date/time/location, Reception venue, Dress code
5. **Photo Gallery**: 6-8 couple photos in masonry or grid layout
6. **Wedding Party**: Bridesmaids and groomsmen cards with photos and roles
7. **Registry**: Links to gift registries with store logos
8. **RSVP Form**: Name, email, attendance (Accept/Decline), meal preference, +1 option
9. **Accommodations**: Hotel recommendations with booking links and room blocks
10. **Footer**: Couple names, wedding date, hashtag

**For Event Planners (alternative):**
1. **Hero**: "Creating Unforgettable Moments" with stunning event imagery
2. **Services**: Wedding, Corporate Events, Birthday Parties, Anniversary Celebrations
3. **Portfolio**: Past event galleries organized by type
4. **Pricing Packages**: Bronze, Silver, Gold tiers
5. **Testimonials**: Client reviews with event photos
6. **Contact Form**: Event inquiry with date picker

**Wedding Hero Example:**
\`\`\`json
{
  "type": "Section", "styles": { "backgroundColor": "#FFFBEB", "padding": "120px 24px", "textAlign": "center" },
  "children": [{
    "type": "Container", "styles": { "maxWidth": "800px", "margin": "0 auto" },
    "children": [
      { "type": "Text", "props": { "children": "WE'RE GETTING MARRIED" }, "styles": { "fontSize": "14px", "letterSpacing": "4px", "color": "#A16207", "marginBottom": "24px" }},
      { "type": "Heading", "props": { "children": "Sarah & James", "level": "h1" }, "styles": { "fontSize": "72px", "fontFamily": "Georgia, serif", "fontWeight": "400", "color": "#1C1917", "marginBottom": "16px", "letterSpacing": "2px" }},
      { "type": "Text", "props": { "children": "June 15, 2025 • Napa Valley, California" }, "styles": { "fontSize": "20px", "color": "#78716C", "marginBottom": "40px" }},
      { "type": "Image", "props": { "src": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop", "alt": "Sarah and James" }, "styles": { "width": "100%", "maxWidth": "500px", "borderRadius": "8px", "margin": "0 auto 40px", "boxShadow": "0 20px 40px rgba(0,0,0,0.1)" }},
      { "type": "Button", "props": { "children": "RSVP Now" }, "styles": { "backgroundColor": "#BE185D", "color": "#FFFFFF", "padding": "16px 48px", "borderRadius": "0", "border": "none", "fontSize": "14px", "letterSpacing": "2px" }}
    ]
  }]
}
\`\`\`

**RSVP Form Example:**
\`\`\`json
{
  "type": "Section", "styles": { "backgroundColor": "#FFF1F2", "padding": "80px 24px" },
  "children": [{
    "type": "Container", "styles": { "maxWidth": "500px", "margin": "0 auto", "textAlign": "center" },
    "children": [
      { "type": "Text", "props": { "children": "Will You Join Us?" }, "styles": { "fontSize": "14px", "letterSpacing": "3px", "color": "#9D174D", "marginBottom": "16px" }},
      { "type": "Heading", "props": { "children": "RSVP", "level": "h2" }, "styles": { "fontSize": "48px", "fontFamily": "Georgia, serif", "fontWeight": "400", "color": "#1C1917", "marginBottom": "32px" }},
      { "type": "Div", "styles": { "backgroundColor": "#FFFFFF", "padding": "40px", "borderRadius": "16px", "boxShadow": "0 4px 20px rgba(0,0,0,0.08)", "textAlign": "left" }, "children": [
        { "type": "Form", "children": [
          { "type": "InputLabel", "props": { "children": "Your Name" }, "styles": { "marginBottom": "8px", "fontWeight": "500" }},
          { "type": "TextInput", "props": { "placeholder": "Full Name" }, "styles": { "marginBottom": "20px", "width": "100%", "padding": "14px", "border": "1px solid #E2E8F0", "borderRadius": "8px" }},
          { "type": "InputLabel", "props": { "children": "Email Address" }, "styles": { "marginBottom": "8px", "fontWeight": "500" }},
          { "type": "TextInput", "props": { "placeholder": "email@example.com" }, "styles": { "marginBottom": "20px", "width": "100%", "padding": "14px", "border": "1px solid #E2E8F0", "borderRadius": "8px" }},
          { "type": "InputLabel", "props": { "children": "Will you attend?" }, "styles": { "marginBottom": "8px", "fontWeight": "500" }},
          { "type": "Select", "props": { "options": ["Joyfully Accept", "Regretfully Decline"] }, "styles": { "marginBottom": "24px", "width": "100%" }},
          { "type": "FormButton", "props": { "children": "Submit RSVP" }, "styles": { "backgroundColor": "#BE185D", "color": "#FFFFFF", "padding": "16px 32px", "borderRadius": "8px", "border": "none", "fontSize": "16px", "width": "100%", "fontWeight": "600" }}
        ]}
      ]}
    ]
  }]
}
\`\`\`
`;
}

// Optimized: Return only essential context to prevent prompt size issues
export function buildAIContext(): string {
  return [
    generateComponentDocs(),
    generateNavigationStyles(),
    generateColorPalettes(),
    generateDesignTokens(),
  ].join('\n\n');
}
