import { useState } from 'react';
import type { PropertySchema } from '../../types';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
    properties: PropertySchema[];
    onPropertyChange: (id: string, value: string | number | boolean) => void;
    onBack: () => void;
}

export function PropertiesPanel({ properties, onPropertyChange, onBack }: PropertiesPanelProps) {
    const [localValues, setLocalValues] = useState<Record<string, string | number | boolean>>(() => {
        const initial: Record<string, string | number | boolean> = {};
        properties.forEach(prop => {
            initial[prop.id] = prop.value;
        });
        return initial;
    });

    const handleChange = (id: string, value: string | number | boolean) => {
        setLocalValues(prev => ({ ...prev, [id]: value }));
        onPropertyChange(id, value);
    };

    const renderInput = (property: PropertySchema) => {
        const value = localValues[property.id] ?? property.value;

        switch (property.type) {
            case 'color':
                return (
                    <div className="property-input property-input--color">
                        <input
                            type="color"
                            value={value as string}
                            onChange={(e) => handleChange(property.id, e.target.value)}
                            className="property-input__color-picker"
                        />
                        <input
                            type="text"
                            value={value as string}
                            onChange={(e) => handleChange(property.id, e.target.value)}
                            className="property-input__color-text"
                            placeholder="#000000"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="property-input property-input--number">
                        <input
                            type="range"
                            min={property.min ?? 0}
                            max={property.max ?? 100}
                            step={property.step ?? 1}
                            value={value as number}
                            onChange={(e) => handleChange(property.id, parseFloat(e.target.value))}
                            className="property-input__slider"
                        />
                        <input
                            type="number"
                            min={property.min}
                            max={property.max}
                            step={property.step}
                            value={value as number}
                            onChange={(e) => handleChange(property.id, parseFloat(e.target.value))}
                            className="property-input__number"
                        />
                    </div>
                );

            case 'boolean':
                return (
                    <label className="property-input property-input--boolean">
                        <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => handleChange(property.id, e.target.checked)}
                            className="property-input__checkbox"
                        />
                        <span className="property-input__toggle"></span>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={value as string}
                        onChange={(e) => handleChange(property.id, e.target.value)}
                        className="property-input property-input--select"
                    >
                        {property.options?.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            default:
                return null;
        }
    };

    if (properties.length === 0) {
        return (
            <div className="properties-panel">
                <div className="properties-panel__header">
                    <button onClick={onBack} className="properties-panel__back-btn">
                        ← Back to Refine
                    </button>
                    <h3 className="properties-panel__title">Properties</h3>
                </div>
                <div className="properties-panel__empty">
                    <p>No adjustable properties available for this animation.</p>
                    <p className="properties-panel__empty-hint">
                        The AI didn't define any parameters for this animation.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="properties-panel">
            <div className="properties-panel__header">
                <button onClick={onBack} className="properties-panel__back-btn">
                    ← Back to Refine
                </button>
                <h3 className="properties-panel__title">Properties</h3>
            </div>
            <div className="properties-panel__content">
                {properties.map(property => (
                    <div key={property.id} className="property-item">
                        <label className="property-item__label">
                            {property.label}
                        </label>
                        {renderInput(property)}
                    </div>
                ))}
            </div>
        </div>
    );
}
