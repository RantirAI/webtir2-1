import { AIProvider, AI_PROVIDERS } from '../store/useAISettingsStore';
import { buildAIContext } from '../utils/aiComponentDocs';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Generate enhanced system prompt with full component context
export const getBuilderSystemPrompt = (): string => {
  const aiContext = buildAIContext();
  
  return `You are an expert UI component builder assistant. You create professional, well-structured web page sections using a visual component system.

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
        "backgroundColor": "hsl(var(--background))"
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
                "color": "hsl(var(--foreground))"
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
                "color": "hsl(var(--muted-foreground))"
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
                    "padding": "12px 32px",
                    "backgroundColor": "hsl(var(--primary))",
                    "color": "hsl(var(--primary-foreground))",
                    "borderRadius": "8px",
                    "fontWeight": "600",
                    "fontSize": "16px"
                  }
                },
                {
                  "type": "Button",
                  "props": { "children": "Learn More" },
                  "styles": {
                    "padding": "12px 32px",
                    "backgroundColor": "transparent",
                    "color": "hsl(var(--foreground))",
                    "border": "1px solid hsl(var(--border))",
                    "borderRadius": "8px",
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
  "message": "I've created a responsive hero section with heading, description, and CTA buttons."
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
        "backgroundColor": "hsl(var(--primary))",
        "padding": "32px",
        "borderRadius": "12px"
      },
      "responsiveStyles": {
        "tablet": { "padding": "24px" },
        "mobile": { "padding": "16px" }
      }
    }
  ],
  "message": "Updated the component with new background color and padding."
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
2. **Use CSS variables** for all colors: \`hsl(var(--primary))\`, \`hsl(var(--foreground))\`, etc.
3. **Use gap for spacing** - avoid margin between siblings
4. **Include responsiveStyles** for tablet and mobile breakpoints on every component
5. **Apply proper padding scale** - sections: 64-80px vertical, cards: 16-24px
6. **Scale typography responsively** - reduce font sizes ~20-30% per breakpoint
7. **Stack layouts on mobile** - change row to column, reduce columns in grids
8. **Full-page layouts** - use minHeight: 100vh for login/auth/hero pages, center with flexbox
9. **Use proper heading levels** - h1 for main headings, h2 for sections, h3 for cards
10. **Center sections** with \`alignItems: center\` and \`justifyContent: center\`

## Update Rules

When updating existing components:
1. Use the **targetId** from the selected component context
2. Only include properties that need to change
3. Always include responsive overrides when changing spacing/typography
4. Use CSS variables for all colors

For UPDATE or DELETE actions, use "action": "update" or "action": "delete".

In DISCUSS mode, have a normal conversation without JSON - help the user plan their UI.

Be concise and focus on creating visually polished, responsive, professional components.`;
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
