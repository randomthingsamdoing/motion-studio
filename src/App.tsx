import { useState, useCallback } from 'react';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';
import { useAnimationGenerator } from './hooks/useAnimationGenerator';
import type { ViewState, AIModel } from './types';
import './index.css';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const {
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
  } = useAnimationGenerator();

  const handleGenerate = useCallback(async (prompt: string, model: AIModel) => {
    const success = await generate(prompt, model);
    // Only transition to editor if generation was successful
    if (success) {
      setView('editor');
    }
  }, [generate]);

  const handleBack = useCallback(() => {
    reset();
    setView('landing');
  }, [reset]);

  if (view === 'landing') {
    return (
      <LandingPage
        onGenerate={handleGenerate}
        isLoading={status === 'generating'}
        error={error}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    );
  }

  return (
    <EditorPage
      code={code}
      css={css}
      status={status}
      error={error}
      conversationHistory={conversationHistory}
      selectedModel={selectedModel}
      properties={properties}
      onRefine={refine}
      onBack={handleBack}
      onCodeUpdate={updateCode}
    />
  );
}

export default App;
