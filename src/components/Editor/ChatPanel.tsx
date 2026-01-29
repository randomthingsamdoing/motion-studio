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
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // Capture current input to append to
        const startValue = input.trim();

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');

            setInput(startValue ? `${startValue} ${currentTranscript}` : currentTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isListening, input]);

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
                        placeholder={isListening ? "Listening..." : "Make the ball blue..."}
                        rows={2}
                        disabled={status === 'generating'}
                    />
                    <button
                        className={`chat-panel__voice-btn ${isListening ? 'is-listening' : ''}`}
                        onClick={toggleListening}
                        disabled={status === 'generating'}
                        title="Voice Input"
                    >
                        {isListening ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                                <line x1="12" x2="12" y1="19" y2="22"></line>
                            </svg>
                        )}
                    </button>
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
