import { useState, useCallback } from 'react';
import type { Message, AIResponse, GenerationStatus, PropertySchema } from '../types';
import { generateAnimationCode, refineAnimationCode } from '../services/openrouter';

interface UseAnimationGeneratorReturn {
    // State
    code: string;
    css: string;
    status: GenerationStatus;
    error: string | null;
    conversationHistory: Message[];
    selectedModel: import('../types').AIModel;
    properties: PropertySchema[];

    // Actions
    generate: (prompt: string, model: import('../types').AIModel) => Promise<boolean>;
    refine: (refinement: string, model: import('../types').AIModel) => Promise<void>;
    setSelectedModel: (model: import('../types').AIModel) => void;
    updateCode: (newCode: string) => void;
    reset: () => void;
}

export function useAnimationGenerator(): UseAnimationGeneratorReturn {
    const [code, setCode] = useState<string>('');
    const [css, setCss] = useState<string>('');
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [selectedModel, setSelectedModel] = useState<import('../types').AIModel>('gpt-oss-120b');
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

    const generate = useCallback(async (prompt: string, model: import('../types').AIModel): Promise<boolean> => {
        setStatus('generating');
        setError(null);

        try {
            const { response, updatedHistory } = await generateAnimationCode(prompt, model, []);
            handleResponse(response, updatedHistory);
            return true;
        } catch (err) {
            handleError(err);
            return false;
        }
    }, [handleResponse, handleError]);

    const refine = useCallback(async (refinement: string, model: import('../types').AIModel) => {
        setStatus('generating');
        setError(null);

        try {
            const { response, updatedHistory } = await refineAnimationCode(refinement, model, conversationHistory);
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
