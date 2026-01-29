import gptLogo from '../assets/logos/gpt.jpg';
import qwenLogo from '../assets/logos/qwen.jpeg';
import glmLogo from '../assets/logos/glm.webp';
import deepseekLogo from '../assets/logos/deepseek.webp';
import kimiLogo from '../assets/logos/kimi.webp';

// AI Model selection
export type AIModel = 'gpt-oss-120b' | 'qwen3-coder' | 'glm-4.5-air' | 'deepseek-r1' | 'kimi-k2';

export const AI_MODELS = {
  'gpt-oss-120b': {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT OSS 120b',
    logo: gptLogo
  },
  'qwen3-coder': {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen 3 Coder',
    logo: qwenLogo
  },
  'glm-4.5-air': {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    logo: glmLogo
  },
  'deepseek-r1': {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'Deepseek R1',
    logo: deepseekLogo
  },
  'kimi-k2': {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    logo: kimiLogo
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
