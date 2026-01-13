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

${aiContext}

---

## Example CREATE Response

{"action":"create","components":[{"type":"Section","label":"Hero","styles":{"background":"linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)","padding":"80px 24px","minHeight":"100vh","display":"flex","alignItems":"center","justifyContent":"center"},"responsiveStyles":{"mobile":{"padding":"40px 16px","minHeight":"auto"}},"children":[{"type":"Container","styles":{"maxWidth":"800px","textAlign":"center"},"children":[{"type":"Heading","props":{"children":"Build Something Amazing","level":"h1"},"styles":{"fontSize":"56px","fontWeight":"700","color":"#FFFFFF"},"responsiveStyles":{"mobile":{"fontSize":"32px"}}},{"type":"Text","props":{"children":"Create beautiful websites with our visual builder."},"styles":{"fontSize":"20px","color":"rgba(255,255,255,0.9)"}},{"type":"Button","props":{"children":"Get Started"},"styles":{"padding":"14px 36px","backgroundColor":"#FFFFFF","color":"#6366F1","borderRadius":"999px","fontWeight":"600"}}]}]}],"message":"Created vibrant hero with purple gradient"}

## Build Rules

1. Use Section > Container > Content structure
2. Use HEX colors for vibrant designs, gradients for heroes
3. Include responsiveStyles for tablet/mobile on every component
4. Always output valid JSON - no markdown, no explanations`;
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
