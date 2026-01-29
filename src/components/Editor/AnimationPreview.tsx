import { useMemo, useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { GenerationStatus } from '../../types';
import './AnimationPreview.css';

interface AnimationPreviewProps {
    code: string;
    css: string;
    status: GenerationStatus;
    error: string | null;
}

export function AnimationPreview({ code, css, status, error }: AnimationPreviewProps) {
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Generate the HTML document for the iframe
    const previewHtml = useMemo(() => {
        // ... (HTML generation logic remains the same)
        if (!code) return '';

        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body, #root {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #18181b;
      overflow: hidden;
    }
    ${css}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    window.React = React;
    window.ReactDOM = ReactDOM;
    const { useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer, useLayoutEffect } = React;
    
    try {
      ${code}
      
      // Fallback: If the code defines an 'Animation' component but doesn't render it,
      // we'll try to render it automatically.
      if (typeof Animation !== 'undefined' && !window.__rendered) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Animation key="${refreshKey}" />); // Use refreshKey to force remount
        window.__rendered = true;
      }
    } catch (error) {
      console.error('Preview Error:', error);
      document.getElementById('root').innerHTML = 
        '<div style="color: #ef4444; padding: 20px; text-align: center; font-family: sans-serif;">' +
        '<strong>Preview Error:</strong><br/>' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
        // ... (previous code)
    }, [code, css, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleIframeLoad = () => {
        setPreviewError(null);
    };

    const handleIframeError = () => {
        setPreviewError('Failed to load preview');
    };

    const renderContent = () => {
        if (status === 'generating') {
            return (
                <div className="animation-preview__loading">
                    <LoadingSpinner size="lg" />
                    <span>Generating animation...</span>
                </div>
            );
        }

        if (error || previewError) {
            return (
                <div className="animation-preview__error">
                    <div className="animation-preview__error-title">⚠️ Error</div>
                    <div className="animation-preview__error-message">
                        {error || previewError}
                    </div>
                </div>
            );
        }

        if (!code) {
            return (
                <div className="animation-preview__empty">
                    <div className="animation-preview__empty-icon">✨</div>
                    <span>Your animation will appear here</span>
                </div>
            );
        }

        return (
            <iframe
                key={refreshKey}
                className="animation-preview__iframe"
                srcDoc={previewHtml}
                sandbox="allow-scripts"
                title="Animation Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
            />
        );
    };

    return (
        <div className="animation-preview">
            <div className="animation-preview__header">
                <span className="animation-preview__title">Preview</span>
                {code && (
                    <div className="animation-preview__actions">
                        <button
                            className="animation-preview__action-btn"
                            onClick={handleRefresh}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                )}
            </div>
            <div className="animation-preview__content">
                {renderContent()}
            </div>
        </div>
    );
}
