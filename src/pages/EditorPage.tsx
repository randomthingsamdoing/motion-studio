import { useState } from 'react';
import { AnimationPreview } from '../components/Editor/AnimationPreview';
import { ChatPanel } from '../components/Editor/ChatPanel';
import { PropertiesPanel } from '../components/Editor/PropertiesPanel';
import type { Message, GenerationStatus, AIModel, PropertySchema } from '../types';
import './EditorPage.css';

interface EditorPageProps {
    code: string;
    css: string;
    status: GenerationStatus;
    error: string | null;
    conversationHistory: Message[];
    selectedModel: AIModel;
    properties: PropertySchema[];
    onRefine: (refinement: string, model: AIModel) => void;
    onBack: () => void;
    onCodeUpdate: (newCode: string) => void;
}

export function EditorPage({
    code,
    css,
    status,
    error,
    conversationHistory,
    selectedModel,
    properties,
    onRefine,
    onBack,
    onCodeUpdate
}: EditorPageProps) {
    const [panelMode, setPanelMode] = useState<'refine' | 'properties'>('refine');

    const handlePropertyChange = (id: string, value: string | number | boolean) => {
        // Update the PARAMS object in the code
        let updatedCode = code;

        // Find and replace the property value in the PARAMS object
        const paramsRegex = /const PARAMS = \{[\s\S]*?\};/;
        const paramsMatch = code.match(paramsRegex);

        if (paramsMatch) {
            let paramsBlock = paramsMatch[0];

            // Create a regex to match the specific property
            const propertyRegex = new RegExp(`(${id}\\s*:\\s*)([^,\\n}]+)`, 'g');

            // Format the new value based on type
            let formattedValue: string;
            if (typeof value === 'string' && value.startsWith('#')) {
                formattedValue = `'${value}'`;
            } else if (typeof value === 'string') {
                formattedValue = `'${value}'`;
            } else if (typeof value === 'boolean') {
                formattedValue = value.toString();
            } else {
                formattedValue = value.toString();
            }

            // Replace the property value
            paramsBlock = paramsBlock.replace(propertyRegex, `$1${formattedValue}`);

            // Replace the entire PARAMS block in the code
            updatedCode = code.replace(paramsRegex, paramsBlock);

            // Update the code
            onCodeUpdate(updatedCode);
        }
    };

    return (
        <div className="editor-page">
            <header className="editor-page__header">
                <span className="editor-page__logo">Motion Studio</span>
            </header>

            <main className="editor-page__content">
                <aside className="editor-page__chat">
                    {panelMode === 'refine' ? (
                        <ChatPanel
                            messages={conversationHistory}
                            status={status}
                            selectedModel={selectedModel}
                            onRefine={onRefine}
                            onBack={onBack}
                            onShowProperties={() => setPanelMode('properties')}
                        />
                    ) : (
                        <PropertiesPanel
                            properties={properties}
                            onPropertyChange={handlePropertyChange}
                            onBack={() => setPanelMode('refine')}
                        />
                    )}
                </aside>

                <section className="editor-page__preview">
                    <AnimationPreview
                        code={code}
                        css={css}
                        status={status}
                        error={error}
                    />
                </section>
            </main>
        </div>
    );
}
