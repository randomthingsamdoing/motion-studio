import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { Message, GenerationStatus, AIModel } from '../../types';
import './ChatPanel.css';

interface ChatPanelProps {
    messages: Message[];
    status: GenerationStatus;
    selectedModel: AIModel;
    onRefine: (refinement: string, model: AIModel) => void;
    onBack: () => void;
    onShowProperties: () => void;  // New prop for showing properties panel
}

export function ChatPanel({ messages, status, selectedModel, onRefine, onBack, onShowProperties }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = useCallback(() => {
        const trimmed = input.trim();
        if (trimmed && status !== 'generating') {
            onRefine(trimmed, selectedModel);
            setInput('');
        }
    }, [input, status, selectedModel, onRefine]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    // Filter to show only user/assistant messages (not system)
    const displayMessages = messages.filter(m => m.role !== 'system');

    return (
        <div className="chat-panel">
            <div className="chat-panel__header">
                <span className="chat-panel__title">Refine Animation</span>
                <div className="chat-panel__header-actions">
                    <button className="chat-panel__properties-btn" onClick={onShowProperties}>
                        ⚙️ Properties
                    </button>
                    <button className="chat-panel__back-btn" onClick={onBack}>
                        ← New
                    </button>
                </div>
            </div>

            <div className="chat-panel__messages">
                {displayMessages.length === 0 ? (
                    <div className="chat-panel__empty">
                        <div className="chat-panel__empty-title">Animation generated!</div>
                        <div className="chat-panel__empty-hint">
                            Describe changes to refine your animation
                        </div>
                    </div>
                ) : (
                    displayMessages.map((message, index) => (
                        <div
                            key={index}
                            className={`chat-panel__message chat-panel__message--${message.role}`}
                        >
                            <div className="chat-panel__message-content">
                                {message.role === 'user'
                                    ? message.content.replace('Please refine the animation with the following changes: ', '')
                                    : 'Animation updated ✓'
                                }
                            </div>
                        </div>
                    ))
                )}

                {status === 'generating' && (
                    <div className="chat-panel__thinking">
                        <LoadingSpinner size="sm" />
                        <span>Refining...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-panel__input-area">
                <div className="chat-panel__input-wrapper">
                    <textarea
                        className="chat-panel__input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Make the ball blue..."
                        rows={2}
                        disabled={status === 'generating'}
                    />
                    <button
                        className="chat-panel__send-btn"
                        onClick={handleSubmit}
                        disabled={!input.trim() || status === 'generating'}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}
