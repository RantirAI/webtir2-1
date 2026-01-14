import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'custom';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  baseUrl: string;
  models: string[];
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      // GPT-5 family
      'gpt-5.2',
      'gpt-5.2-pro',
      'gpt-5.1',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5-pro',
      // Reasoning models
      'o3',
      'o3-mini',
      'o3-pro',
      'o4-mini',
      // GPT-4.1 family
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      // GPT-4o family (proven stable)
      'gpt-4o',
      'gpt-4o-mini',
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      // Claude 4.5 - 64K output (newest)
      'claude-opus-4-5-20251101',
      'claude-sonnet-4-5-20250929',
      // Claude 4 - 32K output
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      // Claude 3.5/3 legacy
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      // Gemini 2.5 - 65K output
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    baseUrl: '',
    models: [],
  },
];

interface AISettingsStore {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint: string;
  customModel: string;
  lastChatMode: 'build' | 'discuss';

  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setCustomEndpoint: (url: string) => void;
  setCustomModel: (model: string) => void;
  setLastChatMode: (mode: 'build' | 'discuss') => void;
  isConfigured: () => boolean;
  getProviderConfig: () => AIProviderConfig;
  clearSettings: () => void;
}

export const useAISettingsStore = create<AISettingsStore>()(
  persist(
    (set, get) => ({
      provider: 'openai',
      apiKey: '',
      model: 'gpt-5',
      customEndpoint: '',
      customModel: '',
      lastChatMode: 'build',

      setProvider: (provider) => {
        const config = AI_PROVIDERS.find((p) => p.id === provider);
        set({
          provider,
          model: config?.models[0] || '',
        });
      },

      setApiKey: (apiKey) => set({ apiKey }),

      setModel: (model) => set({ model }),

      setCustomEndpoint: (customEndpoint) => set({ customEndpoint }),

      setCustomModel: (customModel) => set({ customModel }),

      setLastChatMode: (lastChatMode) => set({ lastChatMode }),

      isConfigured: () => {
        const state = get();
        if (state.provider === 'custom') {
          return !!state.customEndpoint;
        }
        return !!state.apiKey;
      },

      getProviderConfig: () => {
        const state = get();
        return AI_PROVIDERS.find((p) => p.id === state.provider) || AI_PROVIDERS[0];
      },

      clearSettings: () =>
        set({
          provider: 'openai',
          apiKey: '',
          model: 'gpt-5',
          customEndpoint: '',
          customModel: '',
          lastChatMode: 'build',
        }),
    }),
    {
      name: 'builder-ai-settings',
    }
  )
);
