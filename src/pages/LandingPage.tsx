import { PromptInput } from '../components/Landing/PromptInput';
import type { AIModel } from '../types';
import './LandingPage.css';

interface LandingPageProps {
    onGenerate: (prompt: string, model: AIModel) => void;
    isLoading: boolean;
    error: string | null;
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
}

export function LandingPage({ onGenerate, isLoading, error, selectedModel, onModelChange }: LandingPageProps) {
    return (
        <div className="landing-page">
            <div className="landing-page__content">
                <header className="landing-page__header">
                    <h1 className="landing-page__title">Motion Studio</h1>
                    <p className="landing-page__subtitle">
                        Describe your animation, let AI bring it to life
                    </p>
                </header>

                <PromptInput
                    onSubmit={onGenerate}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                />

                {error && (
                    <div className="landing-page__error">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
