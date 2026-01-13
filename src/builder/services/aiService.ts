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

## Example Hero Section (Split Layout with Image)

{"action":"create","components":[{"type":"Section","styles":{"background":"linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)","padding":"100px 24px"},"children":[{"type":"Container","styles":{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"48px","alignItems":"center","maxWidth":"1200px","margin":"0 auto"},"responsiveStyles":{"mobile":{"gridTemplateColumns":"1fr"}},"children":[{"type":"Div","styles":{"display":"flex","flexDirection":"column","gap":"24px"},"children":[{"type":"Div","styles":{"display":"inline-flex","backgroundColor":"rgba(255,255,255,0.2)","padding":"8px 16px","borderRadius":"999px","width":"fit-content"},"children":[{"type":"Text","props":{"children":"✨ Full Stack Developer"},"styles":{"color":"#FFFFFF","fontSize":"14px","fontWeight":"500"}}]},{"type":"Heading","props":{"children":"Hi, I'm John Doe.","level":"h1"},"styles":{"color":"#FFFFFF","fontSize":"56px","fontWeight":"800","lineHeight":"1.1"}},{"type":"Text","props":{"children":"I build scalable and efficient web applications using modern technologies."},"styles":{"color":"rgba(255,255,255,0.9)","fontSize":"20px","lineHeight":"1.6"}},{"type":"Div","styles":{"display":"flex","gap":"16px"},"children":[{"type":"Button","props":{"children":"Contact Me"},"styles":{"backgroundColor":"#FFFFFF","color":"#6366F1","padding":"16px 32px","borderRadius":"8px","fontWeight":"600","border":"none"}},{"type":"Button","props":{"children":"View My Work"},"styles":{"backgroundColor":"transparent","color":"#FFFFFF","border":"2px solid rgba(255,255,255,0.5)","padding":"16px 32px","borderRadius":"8px"}}]}]},{"type":"Image","props":{"src":"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop","alt":"Developer at work"},"styles":{"width":"100%","borderRadius":"16px","boxShadow":"0 25px 50px rgba(0,0,0,0.25)"}}]}]}],"message":"Created hero section with profile"}

## Example CREATE Response (Multi-Testimonial)

{"action":"create","components":[{"type":"Section","label":"Testimonials","styles":{"backgroundColor":"#F0F9FF","padding":"80px 24px"},"children":[{"type":"Container","styles":{"maxWidth":"1200px","margin":"0 auto"},"children":[{"type":"Heading","props":{"children":"What Our Customers Say","level":"h2"},"styles":{"fontSize":"40px","fontWeight":"700","color":"#0F172A","textAlign":"center","marginBottom":"48px"}},{"type":"Div","styles":{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"24px"},"responsiveStyles":{"mobile":{"gridTemplateColumns":"1fr"}},"children":[{"type":"Div","styles":{"backgroundColor":"#FFFFFF","padding":"32px","borderRadius":"16px","boxShadow":"0 4px 20px rgba(0,0,0,0.08)"},"children":[{"type":"Text","props":{"children":"Since implementing this platform, our team productivity increased by 40%. The intuitive interface meant zero training time."},"styles":{"fontSize":"16px","lineHeight":"1.7","color":"#334155","marginBottom":"24px"}},{"type":"Text","props":{"children":"Sarah Chen"},"styles":{"fontWeight":"600","color":"#0F172A"}},{"type":"Text","props":{"children":"VP of Operations, TechFlow"},"styles":{"fontSize":"14px","color":"#64748B"}}]},{"type":"Div","styles":{"backgroundColor":"#FFFFFF","padding":"32px","borderRadius":"16px","boxShadow":"0 4px 20px rgba(0,0,0,0.08)"},"children":[{"type":"Text","props":{"children":"Best investment we made this year. The ROI was visible in the first month and support team is incredibly responsive."},"styles":{"fontSize":"16px","lineHeight":"1.7","color":"#334155","marginBottom":"24px"}},{"type":"Text","props":{"children":"Marcus Johnson"},"styles":{"fontWeight":"600","color":"#0F172A"}},{"type":"Text","props":{"children":"CEO, GrowthLabs"},"styles":{"fontSize":"14px","color":"#64748B"}}]},{"type":"Div","styles":{"backgroundColor":"#FFFFFF","padding":"32px","borderRadius":"16px","boxShadow":"0 4px 20px rgba(0,0,0,0.08)"},"children":[{"type":"Text","props":{"children":"Incredible product that transformed how we work. Highly recommend to any growing business looking to scale efficiently."},"styles":{"fontSize":"16px","lineHeight":"1.7","color":"#334155","marginBottom":"24px"}},{"type":"Text","props":{"children":"Emily Rodriguez"},"styles":{"fontWeight":"600","color":"#0F172A"}},{"type":"Text","props":{"children":"Founder, StartupHQ"},"styles":{"fontSize":"14px","color":"#64748B"}}]}]}]}]}],"message":"Created testimonials section with 3 reviews"}

## Build Rules

1. Use Section > Container > Content structure
2. ALTERNATE backgrounds between sections (never same twice in a row)
3. Generate 3+ items for testimonials, 4+ for features, 3 for pricing
4. Use HEX colors for vibrant designs, gradients for heroes
5. Include responsiveStyles for tablet/mobile on every component
6. Always output valid JSON - no markdown, no explanations`;
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
