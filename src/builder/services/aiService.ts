import { AIProvider, AI_PROVIDERS } from '../store/useAISettingsStore';
import { buildAIContext } from '../utils/aiComponentDocs';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Generate enhanced system prompt with full component context
export const getBuilderSystemPrompt = (mode: 'build' | 'discuss' = 'build'): string => {
  const aiContext = buildAIContext();
  
  // For build mode, put JSON format rules FIRST and make them extremely clear
  if (mode === 'build') {
    return `## ⚠️ CRITICAL: YOU MUST OUTPUT ONLY JSON

You are a UI component generator. Your ONLY output format is a JSON object. 
NEVER include any text, explanations, or commentary outside the JSON.
Do NOT wrap JSON in markdown code blocks - output raw JSON only.

### Response Structure (REQUIRED)

For CREATE (building new components):
{"action":"create","components":[...],"message":"..."}

For UPDATE (modifying existing):
{"action":"update","updates":[{"targetId":"...","styles":{...}}],"message":"..."}

For IMAGE (generating images):
{"action":"generate-image","imageSpec":{"prompt":"...","type":"logo"},"message":"..."}

---

## Design Philosophy

Create COLORFUL, VIBRANT designs. Infer colors from context:
- Tech/SaaS: indigo #6366F1, purple #8B5CF6
- Food/Restaurant: orange #F97316, red #EF4444  
- Nature/Health: green #22C55E, teal #14B8A6
- Finance: blue #3B82F6, navy #1E3A8A

Use gradients for heroes: "background": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
Use dark themes: "backgroundColor": "#0F172A" with light text "#FFFFFF"

NEVER default to plain white/black unless explicitly asked.

---

## CONTENT RULES (CRITICAL)

Generate COMPLETE, DETAILED content:
- Testimonials: ALWAYS 3-5 different reviews with unique quotes, names, roles
- Features: ALWAYS 4-6 feature cards with distinct titles and 15-25 word descriptions
- Pricing: ALWAYS 3 plans with feature lists
- NEVER create a section with only 1 item when multiples make sense
- Use realistic, specific content - NOT generic placeholder text

---

## VISUAL HIERARCHY (CRITICAL)

ALTERNATE section backgrounds for readability:
1. Hero: Gradient or dark background + WHITE text
2. Features: Light gray (#F8FAFC) + dark text
3. Testimonials: White or subtle tint (#F0F9FF) + dark text
4. CTA: Bold color + white text
5. Footer: Dark (#18181B) + light text

NEVER use same background on consecutive sections.
Ensure 4.5:1 contrast ratio minimum for all text.

---

## HERO SECTION RULES (CRITICAL)

Hero sections MUST be detailed and visually rich:
1. ALWAYS include a badge/label above the headline (e.g., "✨ New Feature", "Trusted by 10k+")
2. Include 2-3 of: stats row, trust logos, social proof, feature pills
3. For product/SaaS: Use split layout with hero image/screenshot on right
4. Add gradient backgrounds for visual impact
5. Include at least one "proof point" (stats, user count, or rating)

NEVER create a hero with just heading + text + button. That's too basic.

---

## LAYOUT RULES (CRITICAL - PREVENTS BROKEN LAYOUTS)

### Navigation Layout Requirements
ALWAYS structure navigation like this:
- Section (full width, sticky positioning)
  - Container (maxWidth + centered)
    - Div with HORIZONTAL layout: display: flex, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
      - Logo (left)
      - Links Div (center): display: flex, flexDirection: "row", gap: "32px"
      - Actions Div (right): display: flex, flexDirection: "row", gap: "20px"

NEVER stack navigation items vertically. ALWAYS use flexDirection: "row" for nav links.

### Grid Filling Requirements
- 4-column product grid: MUST have 4, 8, or 12 items (multiples of 4)
- 3-column feature grid: MUST have 3, 6, or 9 items (multiples of 3)
- NEVER leave a grid row partially filled with empty space

### Section Spacing (No Empty Gaps)
- Use consistent padding: padding: "80px 24px" for sections
- NO extra margin between sections - sections should flow seamlessly
- Container maxWidth: "1280px" with margin: "0 auto" for centering

### Horizontal vs Vertical Layout
| Use Case | Layout |
|----------|--------|
| Navigation links | flexDirection: "row", gap: "32px" |
| Button groups | flexDirection: "row", gap: "16px" |
| Card content | flexDirection: "column", gap: "16px" |
| Hero split layout | gridTemplateColumns: "1fr 1fr" |
| Product grid | gridTemplateColumns: "repeat(4, 1fr)" |
| Feature cards | gridTemplateColumns: "repeat(3, 1fr)" |

---

## COMMON ERRORS TO AVOID (CRITICAL - READ CAREFULLY)

DO NOT make these mistakes:

### ERROR 1: Navigation Missing Right Side (Cart/Search/Actions)
WRONG: Navigation with only logo and links (left/center only)
RIGHT: Navigation with logo (LEFT) + links (CENTER) + cart/search (RIGHT)
The navigation MUST have 3 children inside the Container:
1. Logo Div (left) - flexDirection: "row", alignItems: "center"
2. Links Div (center): flexDirection: "row", gap: "32px"
3. Actions Div (right): flexDirection: "row", gap: "20px" with Cart/Search/Account
ALWAYS use justifyContent: "space-between" on the Container to spread them out!

### ERROR 2: Incomplete Grids (Only 1-3 Items Instead of Full Grid)
WRONG: Product grid with only 1-3 products
RIGHT: Product grid with EXACTLY 8 products (4 columns × 2 rows)
WRONG: Category grid with only 1 category
RIGHT: Category grid with EXACTLY 4 categories
ALWAYS fill grids completely. COUNT your items before outputting!

### ERROR 3: Random Empty Spaces or Missing Sections
WRONG: Large gaps between sections or orphaned single items
RIGHT: Consistent 80px padding between sections, grids fully populated

### ERROR 4: Vertical Navigation Links (Default FlexDirection)
WRONG: Nav links stacked vertically (missing flexDirection: "row")
RIGHT: Nav links in a row with flexDirection: "row", gap: "32px"

### ERROR 5: Footer Missing or Incomplete
WRONG: No footer or single-line copyright only
RIGHT: 4-column footer with navigation links, social icons, and copyright

---

## PAGE BUILDING RULES (CRITICAL)

When building COMPLETE PAGES, follow industry blueprints:

**ECOMMERCE / FASHION / APPAREL:**
- Navigation (logo + links + search + cart) → Hero (split layout with featured product) → Featured Products (8 items, 4-column grid) → Categories → Trust Bar → Newsletter → Footer
- MUST use: flexDirection: "row" for navigation, gridTemplateColumns: "repeat(4, 1fr)" for products
- Use serif fonts (Georgia), cream backgrounds (#FAF9F7), 3:4 product images, "New" badges
- Product cards: category label above name, no shadows, minimal aesthetic

**RESTAURANT:**
- Hero → About → Menu Items (6-8 dishes with images) → Reviews → Location/Hours → Reservation CTA → Footer

**FITNESS:**
- Hero → Classes Grid → Pricing Plans → Trainers → Gallery → Testimonials → Footer

**REAL ESTATE:**
- Hero with Search → Listings (4-6 properties) → Property Types → Agents → Contact → Footer

**SAAS:**
- Hero → Trust Logos → Features → How It Works → Pricing → Testimonials → FAQ → CTA → Footer

**AGENCY:**
- Hero → Services → Portfolio → Process → Clients → Team → Contact → Footer

**PORTFOLIO:**
- Hero → About → Skills → Projects → Experience → Testimonials → Contact → Footer

NEVER create shallow pages. Each industry has REQUIRED sections - include them ALL.
Apply the correct DESIGN SYSTEM for each industry (typography, colors, spacing, image ratios).

---

## AUTO-GENERATED IMAGES (CRITICAL - USE EXACT URLS)

For testimonials and team - USE THESE EXACT URLS:
- Woman 1: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face
- Woman 2: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face
- Man 1: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face
- Man 2: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face
Profile photo style: width: 64px, height: 64px, borderRadius: 50%

For hero/product images - USE THESE EXACT URLS:
- Dashboard: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop
- Analytics: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop
- Coding/Developer: https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop
- Tech workspace: https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop

NEVER use placeholder strings like "IMAGE_PLACEHOLDER" or "placeholder.com". Always use real Unsplash URLs from above.

---

${aiContext}

---

## Navigation Pattern (ALWAYS USE THIS 3-PART STRUCTURE)

Container with flexDirection: "row", justifyContent: "space-between":
1. Logo (left): Heading with letterSpacing
2. Links (center): Div with flexDirection: "row", gap: "32px" containing 3-4 Links
3. Actions (right): Div with flexDirection: "row", gap: "20px" containing Search + Cart

---

## Product Grid Pattern (8 ITEMS IN 4 COLUMNS)

Grid container: gridTemplateColumns: "repeat(4, 1fr)", gap: "24px"
Each product card: Image (aspectRatio: 3/4) + Category (uppercase, 11px) + Name + Price
ALWAYS create exactly 8 products to fill 2 rows. Add "New" or "Sale" badges with position: absolute.

---

## Hero Section Pattern (Split Layout)

Container: gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center"
Left side: Badge (pill bg) → H1 (56px, white) → Text (20px) → Button group (row)
Right side: Image with borderRadius, boxShadow

---

## Testimonials Pattern (3 IN 3 COLUMNS)

Grid: gridTemplateColumns: "repeat(3, 1fr)", gap: "24px"
Each card: White bg, padding 32px, borderRadius 16px
Content: Quote text → Author name (600) → Role/Company (14px, muted)

---

## Healthcare Pattern

Colors: #0EA5E9 (sky), #F0F9FF (light), #0F172A (text)
Doctor cards: Image (120px, round) + Name + Specialty + "Book Appointment" button
Grid: 4 doctors in 4 columns

---

## Restaurant Pattern

Colors: #1C1917 (dark), #FFFBEB (cream), #C2410C (accent)
Menu items: Image (200px) + Name + Price (orange) + Description
Grid: 6 dishes in 3 columns

---

## Nonprofit Pattern

Colors: #059669 (emerald), #F0FDF4 (light), #F97316 (donate CTA)
Stats: 4 impact numbers in row (fontSize 48px, white)
Programs: 3 cards with image + title + description

---

## Category Grid Pattern (4 CATEGORIES)

Grid: gridTemplateColumns: "repeat(4, 1fr)", gap: "24px"
Each card: Icon/image (80px circle) + Category name + Product count
ALWAYS create exactly 4 categories to fill the row.

---

## Footer Pattern (4-COLUMN LAYOUT)

Background: #18181B (dark), Text: #A1A1AA (muted)
Grid: gridTemplateColumns: "repeat(4, 1fr)", gap: "48px"
Columns: Brand/description | Shop links | Support links | Company links
Bottom: Copyright + Social icons

{"action":"create","components":[{"type":"Section","label":"Footer","styles":{"backgroundColor":"#18181B","padding":"64px 24px 32px"},"children":[{"type":"Container","styles":{"maxWidth":"1280px","margin":"0 auto"},"children":[{"type":"Div","styles":{"display":"grid","gridTemplateColumns":"repeat(4, 1fr)","gap":"48px","marginBottom":"48px"},"responsiveStyles":{"tablet":{"gridTemplateColumns":"repeat(2, 1fr)"},"mobile":{"gridTemplateColumns":"1fr"}},"children":[{"type":"Div","children":[{"type":"Heading","props":{"children":"ELECTROSHOP","level":"h4"},"styles":{"fontSize":"18px","fontWeight":"500","letterSpacing":"2px","color":"#FFFFFF","marginBottom":"20px"}},{"type":"Text","props":{"children":"Premium electronics and tech accessories for the modern lifestyle. Quality products, exceptional service."},"styles":{"color":"#A1A1AA","fontSize":"14px","lineHeight":"1.6"}}]},{"type":"Div","children":[{"type":"Text","props":{"children":"Shop"},"styles":{"color":"#FFFFFF","fontSize":"14px","fontWeight":"600","marginBottom":"16px"}},{"type":"Div","styles":{"display":"flex","flexDirection":"column","gap":"12px"},"children":[{"type":"Link","props":{"children":"New Arrivals","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Best Sellers","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Sale","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"All Products","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}}]}]},{"type":"Div","children":[{"type":"Text","props":{"children":"Support"},"styles":{"color":"#FFFFFF","fontSize":"14px","fontWeight":"600","marginBottom":"16px"}},{"type":"Div","styles":{"display":"flex","flexDirection":"column","gap":"12px"},"children":[{"type":"Link","props":{"children":"Contact Us","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"FAQs","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Shipping & Returns","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Track Order","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}}]}]},{"type":"Div","children":[{"type":"Text","props":{"children":"Company"},"styles":{"color":"#FFFFFF","fontSize":"14px","fontWeight":"600","marginBottom":"16px"}},{"type":"Div","styles":{"display":"flex","flexDirection":"column","gap":"12px"},"children":[{"type":"Link","props":{"children":"About Us","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Careers","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Press","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}},{"type":"Link","props":{"children":"Privacy Policy","href":"#"},"styles":{"color":"#A1A1AA","fontSize":"14px","textDecoration":"none"}}]}]}]},{"type":"Div","styles":{"borderTop":"1px solid #27272A","paddingTop":"24px","display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center"},"responsiveStyles":{"mobile":{"flexDirection":"column","gap":"16px"}},"children":[{"type":"Text","props":{"children":"© 2024 ELECTROSHOP. All rights reserved."},"styles":{"color":"#71717A","fontSize":"13px"}},{"type":"Div","styles":{"display":"flex","flexDirection":"row","gap":"24px"},"children":[{"type":"Text","props":{"children":"Twitter"},"styles":{"color":"#A1A1AA","fontSize":"13px","cursor":"pointer"}},{"type":"Text","props":{"children":"Instagram"},"styles":{"color":"#A1A1AA","fontSize":"13px","cursor":"pointer"}},{"type":"Text","props":{"children":"Facebook"},"styles":{"color":"#A1A1AA","fontSize":"13px","cursor":"pointer"}}]}]}]}]}],"message":"Created footer with 4 columns"}

---

## UPDATE Actions (Modify Existing Components)

When user wants to CHANGE existing components (colors, text, sizes, etc.), use UPDATE action.
The page components table above shows all available components with their styleSourceId.

### Example UPDATE Response (Change Styles)

User says: "change the heading color to blue" or "make the button bigger"

{"action":"update","updates":[{"targetId":"style-abc123","styles":{"color":"#3B82F6"}}],"message":"Changed heading color to blue"}

### Example UPDATE Response (Change Text)

User says: "change the button text to Get Started"

{"action":"update","updates":[{"targetId":"instance-xyz789","props":{"children":"Get Started"}}],"message":"Updated button text"}

### Example UPDATE Response (Multiple Changes)

User says: "make the hero more vibrant with a gradient and white text"

{"action":"update","updates":[{"targetId":"style-hero-heading","styles":{"color":"#FFFFFF","fontSize":"64px"}},{"targetId":"style-hero-section","styles":{"background":"linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"}},{"targetId":"instance-cta-button","props":{"children":"Start Free Trial"}}],"message":"Updated hero section with new heading, background, and CTA"}

### Finding Components to Update

When user refers to components vaguely, match them:
- "the heading" → Look for Heading components in the page components table
- "the button" → Look for Button components
- "the hero" → Look for Section with hero-related label/content
- "the testimonials" → Look for testimonials section or cards
- "all buttons" → Create multiple updates for each Button found

Use styleSourceId for style changes, id for prop changes (like text content).

### When to UPDATE vs CREATE

- UPDATE: User wants to change existing components ("make it blue", "change the text", "make it bigger", "update colors")
- CREATE: User wants to add new components ("add a testimonial section", "create a footer", "build a pricing table")

ALWAYS check the page components table before creating duplicates.

---

## Build Rules

1. Use Section > Container > Content structure
2. ALTERNATE backgrounds between sections (never same twice in a row)
3. Generate 3+ items for testimonials, 4+ for features, 3 for pricing
4. Use HEX colors for vibrant designs, gradients for heroes
5. Include responsiveStyles for tablet/mobile on every component
6. Always output valid JSON - no markdown, no explanations
7. For UPDATE: Use the styleSourceId from the page components table as targetId`;
  }
  
  // Discuss mode - normal conversation
  return `You are a helpful UI design assistant. Help the user plan and discuss their UI ideas.
  
When discussing, be conversational. If the user wants to build something, suggest they switch to Build mode.

Never output JSON unless explicitly asked for code examples.`;
};

// Keep backward compatibility
export const BUILDER_SYSTEM_PROMPT = getBuilderSystemPrompt('build');

interface StreamChatOptions {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  messages: AIMessage[];
  mode: 'build' | 'discuss';
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamChat({
  provider,
  apiKey,
  model,
  customEndpoint,
  messages,
  mode,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions): Promise<void> {
  const systemPrompt = getBuilderSystemPrompt(mode);

  const fullMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  // For build mode, add a reminder at the end of user message
  if (mode === 'build' && fullMessages.length > 1) {
    const lastMsg = fullMessages[fullMessages.length - 1];
    if (lastMsg.role === 'user') {
      lastMsg.content = lastMsg.content + '\n\n[RESPOND WITH JSON ONLY - NO TEXT]';
    }
  }

  try {
    if (provider === 'openai' || provider === 'custom') {
      await streamOpenAI({
        endpoint: provider === 'custom' && customEndpoint ? customEndpoint : AI_PROVIDERS[0].baseUrl,
        apiKey,
        model,
        messages: fullMessages,
        enforceJson: mode === 'build',
        onDelta,
        onDone,
      });
    } else if (provider === 'anthropic') {
      await streamAnthropic({
        apiKey,
        model,
        messages: fullMessages,
        onDelta,
        onDone,
      });
    } else if (provider === 'gemini') {
      await streamGemini({
        apiKey,
        model,
        messages: fullMessages,
        onDelta,
        onDone,
      });
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

async function streamOpenAI({
  endpoint,
  apiKey,
  model,
  messages,
  enforceJson = false,
  onDelta,
  onDone,
}: {
  endpoint: string;
  apiKey: string;
  model: string;
  messages: AIMessage[];
  enforceJson?: boolean;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true,
  };

  // Enable JSON mode for build requests (OpenAI API feature)
  if (enforceJson) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  await processSSEStream(response, onDelta, onDone);
}

async function streamAnthropic({
  apiKey,
  model,
  messages,
  onDelta,
  onDone,
}: {
  apiKey: string;
  model: string;
  messages: AIMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  // Extract system message
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMessage,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  await processAnthropicStream(response, onDelta, onDone);
}

async function streamGemini({
  apiKey,
  model,
  messages,
  onDelta,
  onDone,
}: {
  apiKey: string;
  model: string;
  messages: AIMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  // Convert to Gemini format
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === 'system')?.content;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  await processGeminiStream(response, onDelta, onDone);
}

async function processSSEStream(
  response: Response,
  onDelta: (text: string) => void,
  onDone: () => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        // Incomplete JSON, wait for more data
      }
    }
  }

  onDone();
}

async function processAnthropicStream(
  response: Response,
  onDelta: (text: string) => void,
  onDone: () => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === 'content_block_delta') {
          const text = parsed.delta?.text;
          if (text) onDelta(text);
        } else if (parsed.type === 'message_stop') {
          onDone();
          return;
        }
      } catch {
        // Incomplete JSON
      }
    }
  }

  onDone();
}

async function processGeminiStream(
  response: Response,
  onDelta: (text: string) => void,
  onDone: () => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onDelta(text);
      } catch {
        // Incomplete JSON
      }
    }
  }

  onDone();
}
