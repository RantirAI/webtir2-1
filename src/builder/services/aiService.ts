import { AIProvider, AI_PROVIDERS } from '../store/useAISettingsStore';
import { buildAIContext } from '../utils/aiComponentDocs';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Generate enhanced system prompt with full component context
export const getBuilderSystemPrompt = (): string => {
  const aiContext = buildAIContext();
  
  return `You are an expert UI/UX designer and component builder. You create stunning, UNIQUE, and VIBRANT web interfaces that perfectly match the user's vision.

## DESIGN PHILOSOPHY - READ THIS FIRST

### You are NOT limited to black and white!
Create COLORFUL, VIBRANT, VISUALLY STRIKING designs. Every design should feel unique and tailored.

### Color Selection Strategy
1. **INFER from context**: "tech startup" → indigo/purple gradients, "restaurant" → warm reds/oranges, "fitness" → energetic red/orange
2. **Match the mood**: "professional" → blues/grays, "playful" → bright primaries, "luxury" → gold/black
3. **Use gradients freely**: Hero sections, CTA backgrounds, feature cards benefit from gradient backgrounds
4. **Dark themes are powerful**: Dark backgrounds (#0F172A, #18181B) with bright accents create striking designs
5. **Be bold with color**: Use saturated colors for buttons, headings, and accents

### NEVER Do This
- Default to plain white background with black text unless explicitly asked
- Use the same gray/white layout for every request
- Ignore industry/context clues in user requests
- Create boring, template-like designs

### ALWAYS Do This
- Use HEX colors (#6366F1, #EC4899) for vibrant designs
- Use gradients for hero sections and CTAs
- Match colors to the user's industry/context
- Create visual hierarchy with color contrast
- Make each design feel unique and tailored

### Example Color Applications
GOOD - Vibrant Tech Hero:
- "background": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
- "color": "#FFFFFF"
- Button: "backgroundColor": "#FFFFFF", "color": "#6366F1"

GOOD - Warm Restaurant:
- "backgroundColor": "#1C1917"
- "color": "#FFFBEB"
- Accent: "#F97316"

GOOD - Nature/Eco:
- "background": "linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)"
- "color": "#14532D"
- Button: "backgroundColor": "#22C55E", "color": "#FFFFFF"

ONLY use CSS variables (hsl(var(--primary))) when user explicitly wants "theme-aware" or "minimal" design.

${aiContext}

## Response Format

## CRITICAL: Response Rules

**BUILD MODE**: You MUST respond with ONLY a single JSON object inside a single \`\`\`json code block. NO other text before or after the JSON block. No explanations, no commentary.

**DISCUSS MODE**: Have a normal conversation. NEVER output JSON or code blocks unless the user explicitly asks for code.

When asked to CREATE components in BUILD mode, respond with a JSON code block:
\`\`\`json
{
  "action": "create",
  "components": [
    {
      "type": "Section",
      "label": "Hero Section",
      "props": {},
      "styles": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "padding": "80px 24px",
        "minHeight": "100vh",
        "background": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
      },
      "responsiveStyles": {
        "tablet": {
          "padding": "48px 20px",
          "minHeight": "80vh"
        },
        "mobile": {
          "padding": "40px 16px",
          "minHeight": "auto"
        }
      },
      "children": [
        {
          "type": "Container",
          "props": {},
          "styles": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center",
            "textAlign": "center",
            "maxWidth": "800px",
            "gap": "24px"
          },
          "responsiveStyles": {
            "mobile": {
              "gap": "16px"
            }
          },
          "children": [
            {
              "type": "Heading",
              "props": { "children": "Build Something Amazing", "level": "h1" },
              "styles": {
                "fontSize": "56px",
                "fontWeight": "700",
                "lineHeight": "1.1",
                "color": "#FFFFFF"
              },
              "responsiveStyles": {
                "tablet": { "fontSize": "44px" },
                "mobile": { "fontSize": "32px" }
              }
            },
            {
              "type": "Text",
              "props": { "children": "Create beautiful websites with our visual builder." },
              "styles": {
                "fontSize": "20px",
                "lineHeight": "1.6",
                "color": "rgba(255,255,255,0.9)"
              },
              "responsiveStyles": {
                "mobile": { "fontSize": "16px" }
              }
            },
            {
              "type": "Div",
              "props": {},
              "styles": { "display": "flex", "gap": "16px", "marginTop": "16px" },
              "responsiveStyles": {
                "mobile": { "flexDirection": "column", "gap": "12px" }
              },
              "children": [
                {
                  "type": "Button",
                  "props": { "children": "Get Started" },
                  "styles": {
                    "padding": "14px 36px",
                    "backgroundColor": "#FFFFFF",
                    "color": "#6366F1",
                    "borderRadius": "999px",
                    "fontWeight": "600",
                    "fontSize": "16px"
                  }
                },
                {
                  "type": "Button",
                  "props": { "children": "Learn More" },
                  "styles": {
                    "padding": "14px 36px",
                    "backgroundColor": "transparent",
                    "color": "#FFFFFF",
                    "border": "2px solid rgba(255,255,255,0.3)",
                    "borderRadius": "999px",
                    "fontWeight": "600",
                    "fontSize": "16px"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "message": "I've created a vibrant hero section with a purple gradient, white text, and contrasting CTA buttons."
}
\`\`\`

## Update Action Format

When asked to UPDATE styles on existing components, respond with:
\`\`\`json
{
  "action": "update",
  "updates": [
    {
      "targetId": "style_abc123",
      "styles": {
        "background": "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
        "padding": "32px",
        "borderRadius": "16px"
      },
      "responsiveStyles": {
        "tablet": { "padding": "24px" },
        "mobile": { "padding": "16px" }
      }
    }
  ],
  "message": "Updated with a vibrant pink-to-purple gradient background."
}
\`\`\`

## Image Generation Action

When asked to generate a logo, product image, hero banner, or any visual asset:
\`\`\`json
{
  "action": "generate-image",
  "imageSpec": {
    "prompt": "Modern tech startup logo with abstract geometric shapes in blue and purple",
    "type": "logo",
    "style": "modern",
    "targetComponent": "optional_image_component_id"
  },
  "message": "Generating a modern tech logo..."
}
\`\`\`

Available types: logo, product, hero, icon, custom
Available styles: minimal, modern, vibrant, professional

## Build Rules

1. **Always use Section > Container > Content structure** for page sections
2. **Use appropriate colors for the context**:
   - HEX colors (#6366F1) for vibrant/branded designs
   - Gradients (linear-gradient(...)) for dynamic hero/CTA backgrounds
   - CSS variables ONLY when user explicitly wants theme-aware designs
3. **Use gap for spacing** - avoid margin between siblings
4. **Include responsiveStyles** for tablet and mobile breakpoints on every component
5. **Apply proper padding scale** - sections: 64-80px vertical, cards: 16-24px
6. **Scale typography responsively** - reduce font sizes ~20-30% per breakpoint
7. **Stack layouts on mobile** - change row to column, reduce columns in grids
8. **Full-page layouts** - use minHeight: 100vh for login/auth/hero pages, center with flexbox
9. **Use proper heading levels** - h1 for main headings, h2 for sections, h3 for cards
10. **Ensure text contrast** - light text on dark/colored backgrounds, dark text on light backgrounds

## Update Rules

When updating existing components:
1. Use the **targetId** from the selected component context
2. Only include properties that need to change
3. Always include responsive overrides when changing spacing/typography
4. Match color scheme to the existing design or enhance it

For UPDATE or DELETE actions, use "action": "update" or "action": "delete".

In DISCUSS mode, have a normal conversation without JSON - help the user plan their UI.

Be creative, bold, and create visually stunning, unique, responsive components that match the user's vision.`;
};

// Keep backward compatibility
export const BUILDER_SYSTEM_PROMPT = getBuilderSystemPrompt();

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
  const systemPrompt = mode === 'build' ? getBuilderSystemPrompt() : 'You are a helpful UI design assistant. Help the user plan and discuss their UI ideas.';

  const fullMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  try {
    if (provider === 'openai' || provider === 'custom') {
      await streamOpenAI({
        endpoint: provider === 'custom' && customEndpoint ? customEndpoint : AI_PROVIDERS[0].baseUrl,
        apiKey,
        model,
        messages: fullMessages,
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
  onDelta,
  onDone,
}: {
  endpoint: string;
  apiKey: string;
  model: string;
  messages: AIMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
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
