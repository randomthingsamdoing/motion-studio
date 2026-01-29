import { useState, useCallback, type KeyboardEvent } from 'react';
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
            <textarea
                className="prompt-input__textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                autoFocus
            />
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
