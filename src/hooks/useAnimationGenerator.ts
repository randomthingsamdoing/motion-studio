import { useState, useCallback } from 'react';
import type { Message, AIResponse, GenerationStatus, PropertySchema, AIModel } from '../types';
import { AI_MODELS } from '../types';
import * as openrouterService from '../services/openrouter';
import * as geminiService from '../services/gemini';

interface UseAnimationGeneratorReturn {
    // State
    code: string;
    css: string;
    status: GenerationStatus;
    error: string | null;
    conversationHistory: Message[];
    selectedModel: AIModel;
    properties: PropertySchema[];

    // Actions
    generate: (prompt: string, model: AIModel) => Promise<boolean>;
    refine: (refinement: string, model: AIModel) => Promise<void>;
    setSelectedModel: (model: AIModel) => void;
    updateCode: (newCode: string) => void;
    reset: () => void;
}

export function useAnimationGenerator(): UseAnimationGeneratorReturn {
    const [code, setCode] = useState<string>('');
    const [css, setCss] = useState<string>('');
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-flash');
    const [properties, setProperties] = useState<PropertySchema[]>([]);

    const handleResponse = useCallback((response: AIResponse, history: Message[]) => {
        setCode(response.code);
        setCss(response.css);
        setProperties(response.properties || []);
        setConversationHistory(history);
        setStatus('success');
        setError(null);
    }, []);

    const handleError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        setStatus('error');
    }, []);

    const generate = useCallback(async (prompt: string, model: AIModel): Promise<boolean> => {
        setStatus('generating');
        setError(null);

        try {
            // Route to the correct service based on model provider
            const provider = AI_MODELS[model].provider;
            const service = provider === 'gemini' ? geminiService : openrouterService;

            const { response, updatedHistory } = await service.generateAnimationCode(prompt, model, []);
            handleResponse(response, updatedHistory);
            return true;
        } catch (err) {
            handleError(err);
            return false;
        }
    }, [handleResponse, handleError]);

    const refine = useCallback(async (refinement: string, model: AIModel) => {
        setStatus('generating');
        setError(null);

        try {
            // Route to the correct service based on model provider
            const provider = AI_MODELS[model].provider;
            const service = provider === 'gemini' ? geminiService : openrouterService;

            const { response, updatedHistory } = await service.refineAnimationCode(refinement, model, conversationHistory);
            handleResponse(response, updatedHistory);
        } catch (err) {
            handleError(err);
        }
    }, [conversationHistory, handleResponse, handleError]);

    const updateCode = useCallback((newCode: string) => {
        setCode(newCode);
    }, []);

    const reset = useCallback(() => {
        setCode('');
        setCss('');
        setStatus('idle');
        setError(null);
        setConversationHistory([]);
        setProperties([]);
    }, []);

    return {
        code,
        css,
        status,
        error,
        conversationHistory,
        selectedModel,
        properties,
        generate,
        refine,
        setSelectedModel,
        updateCode,
        reset
    };
}
