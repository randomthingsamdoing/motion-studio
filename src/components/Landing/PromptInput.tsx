import { useState, useCallback, useRef, type KeyboardEvent } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ModelSelector } from './ModelSelector';
import type { AIModel } from '../../types';
import './PromptInput.css';

interface PromptInputProps {
    onSubmit: (prompt: string, model: AIModel) => void;
    isLoading?: boolean;
    placeholder?: string;
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
}

export function PromptInput({
    onSubmit,
    isLoading = false,
    placeholder = "Describe your animation... e.g., 'A bouncing ball that changes color'",
    selectedModel,
    onModelChange
}: PromptInputProps) {
    const [value, setValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const toggleListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Your browser does not support speech recognition. Try Chrome or Safari.');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        // Capture current value to append to
        const startValue = value.trim();

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');

            setValue(startValue ? `${startValue} ${currentTranscript}` : currentTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isListening, value]);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (trimmed && !isLoading) {
            onSubmit(trimmed, selectedModel);
        }
    }, [value, isLoading, selectedModel, onSubmit]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Cmd/Ctrl + Enter
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <div className="prompt-input">
            <div className="prompt-input__wrapper">
                <textarea
                    className="prompt-input__textarea"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : placeholder}
                    disabled={isLoading}
                    autoFocus
                />
                <button
                    className={`prompt-input__voice-btn ${isListening ? 'is-listening' : ''}`}
                    onClick={toggleListening}
                    disabled={isLoading}
                    title="Voice Input"
                >
                    {isListening ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                    )}
                </button>
            </div>
            <div className="prompt-input__footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <ModelSelector value={selectedModel} onChange={onModelChange} />
                    <span className="prompt-input__hint">
                        Press ⌘ + Enter to generate
                    </span>
                </div>
                <button
                    className="prompt-input__button"
                    onClick={handleSubmit}
                    disabled={!value.trim() || isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            Generating...
                        </>
                    ) : (
                        'Generate'
                    )}
                </button>
            </div>
        </div>
    );
}
