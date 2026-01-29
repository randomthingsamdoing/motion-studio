import gptLogo from '../assets/logos/gpt.jpg';
import qwenLogo from '../assets/logos/qwen.jpeg';
import glmLogo from '../assets/logos/glm.webp';
import deepseekLogo from '../assets/logos/deepseek.webp';
import kimiLogo from '../assets/logos/kimi.webp';
import geminiLogo from '../assets/logos/gemini.png';

// AI Model selection
export type AIModel = 'gemini-2.5-flash' | 'gpt-oss-120b' | 'qwen3-coder' | 'glm-4.5-air' | 'deepseek-r1' | 'kimi-k2';

export const AI_MODELS = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    logo: geminiLogo,
    provider: 'gemini' as const
  },
  'gpt-oss-120b': {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT OSS 120b',
    logo: gptLogo,
    provider: 'openrouter' as const
  },
  'qwen3-coder': {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen 3 Coder',
    logo: qwenLogo,
    provider: 'openrouter' as const
  },
  'glm-4.5-air': {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    logo: glmLogo,
    provider: 'openrouter' as const
  },
  'deepseek-r1': {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'Deepseek R1',
    logo: deepseekLogo,
    provider: 'openrouter' as const
  },
  'kimi-k2': {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    logo: kimiLogo,
    provider: 'openrouter' as const
  }
} as const;

// Message types for conversation history
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: unknown; // Preserved for multi-turn reasoning
}

// Property schema for adjustable parameters
export type PropertyType = 'color' | 'number' | 'boolean' | 'select';

export interface PropertySchema {
  id: string;              // Variable name in code (e.g., "ballColor")
  label: string;           // Human-friendly label (e.g., "Ball Color")
  type: PropertyType;      // Input type
  value: string | number | boolean;  // Current value
  min?: number;            // For number type
  max?: number;            // For number type
  step?: number;           // For number type
  options?: string[];      // For select type
}

// AI Response structure
export interface AIResponse {
  code: string;
  css: string;
  explanation?: string;
  properties?: PropertySchema[];  // Optional adjustable properties
}

// Conversation state
export interface Conversation {
  messages: Message[];
  currentCode: string;
  currentCSS: string;
}

// View state for routing
export type ViewState = 'landing' | 'editor';

// Generation status
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
