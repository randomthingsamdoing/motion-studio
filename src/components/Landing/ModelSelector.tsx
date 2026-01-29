import { useState, useRef, useEffect } from 'react';
import { AI_MODELS, type AIModel } from '../../types';
import './ModelSelector.css';

interface ModelSelectorProps {
    value: AIModel;
    onChange: (model: AIModel) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedModel = AI_MODELS[value];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="model-selector" ref={dropdownRef}>
            <label className="model-selector__label">Model:</label>
            <div className={`model-selector__dropdown ${isOpen ? 'is-open' : ''}`}>
                <button
                    type="button"
                    className="model-selector__trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="model-selector__selected-content">
                        <img src={selectedModel.logo} alt="" className="model-logo" />
                        <span className="model-name">{selectedModel.name}</span>
                    </div>
                    <span className={`model-selector__arrow ${isOpen ? 'is-open' : ''}`}>▾</span>
                </button>

                {isOpen && (
                    <div className="model-selector__options">
                        {(Object.entries(AI_MODELS) as [AIModel, typeof AI_MODELS['gpt-oss-120b']][]).map(([key, model]) => (
                            <button
                                key={key}
                                type="button"
                                className={`model-selector__option ${value === key ? 'is-selected' : ''}`}
                                onClick={() => {
                                    onChange(key);
                                    setIsOpen(false);
                                }}
                            >
                                <img src={model.logo} alt="" className="model-logo" />
                                <span className="model-name">{model.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
