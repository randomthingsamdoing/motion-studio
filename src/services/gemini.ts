import type { Message, AIResponse, PropertySchema } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// System prompt for animation code generation
const SYSTEM_PROMPT = `You are an expert React developer specializing in CSS animations and motion design.
Your task is to generate React components with beautiful, broadcast-quality CSS animations based on user descriptions.

ENVIRONMENT INFO:
- React and ReactDOM are available globally as window.React and window.ReactDOM.
- Common hooks (useState, useEffect, useRef, useCallback, useMemo) are destructured and available globally.
- You MUST define a component named 'Animation'.
- DO NOT use ES6 import/export syntax.

CRITICAL RULES:
1. Generate ONLY valid React functional component code.
2. ALL CSS must be included in the [CSS] block - do NOT reference external stylesheets.
3. The component must be completely self-contained within the [CODE] block.
4. Use CSS animations, keyframes, and transforms for motion.
5. ALWAYS include the rendering code at the end of [CODE] block.
6. MANDATORY: Identify ALL adjustable parameters (colors, sizes, animation durations, texts, delays).
7. MANDATORY: Define these parameters in a 'PARAMS' constant at the top of the code.
8. MANDATORY: Create a corresponding JSON schema in a [PROPERTIES] block.

LAYOUT REQUIREMENTS (CRITICAL):
1. **Never allow elements to collapse**: ALWAYS specify explicit width, height, min-width, or min-height.
2. **Full canvas usage**: Use 100% width and height of the container.
3. **Complete CSS**: If you use a className, you MUST define its styles in the [CSS] block.
4. **For canvas elements**: ALWAYS set explicit width and height (e.g., width="800" height="600").
5. **Centering**: Use flexbox or grid for reliable centering.

OUTPUT FORMAT (STRICTLY FOLLOW THIS EXACT FORMAT):

[CODE]
// 1. Define ALL adjustable parameters
const PARAMS = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  size: 100,
  duration: 1.5,
  text: 'Hello World'
};

// 2. Define the Animation component
function Animation() {
  // Your component logic here
  
  return (
    <div className="animation-container">
      {/* Your animated content using PARAMS values */}
    </div>
  );
}

// 3. Render the component (REQUIRED - DO NOT SKIP THIS)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Animation />);
window.__rendered = true;
[/CODE]

[CSS]
/* IMPORTANT: Define ALL classes used in your component */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.animation-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Your keyframes and other styles here */
@keyframes yourAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
[/CSS]

[PROPERTIES]
[
  {
    "id": "primaryColor",
    "label": "Primary Color",
    "type": "color",
    "value": "#3b82f6"
  },
  {
    "id": "size",
    "label": "Size (px)",
    "type": "number",
    "value": 100,
    "min": 10,
    "max": 500,
    "step": 10
  },
  {
    "id": "duration",
    "label": "Duration (s)",
    "type": "number",
    "value": 1.5,
    "min": 0.1,
    "max": 10,
    "step": 0.1
  },
  {
    "id": "text",
    "label": "Text",
    "type": "text",
    "value": "Hello World"
  }
]
[/PROPERTIES]

QUALITY GUIDELINES:
- Use smooth easing functions like cubic-bezier(0.4, 0, 0.2, 1)
- Add subtle shadows and gradients for depth
- Ensure animations are smooth and professional
- Make the design modern and visually appealing

REMEMBER: The user CANNOT edit the animation if you don't include the [PROPERTIES] block!`;

function getApiKey(): string {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
        throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
    }
    return key;
}

// Parse AI response to extract code, CSS, and properties
function parseResponse(content: string): AIResponse {
    console.log('[Gemini] Raw response length:', content.length);
    console.log('[Gemini] Raw response preview:', content.substring(0, 800));

    const codeMatch = content.match(/\[CODE\]([\s\S]*?)\[\/CODE\]/);
    const cssMatch = content.match(/\[CSS\]([\s\S]*?)\[\/CSS\]/);
    const propertiesMatch = content.match(/\[PROPERTIES\]([\s\S]*?)\[\/PROPERTIES\]/);

    let properties: PropertySchema[] | undefined;

    // Try to parse properties JSON
    if (propertiesMatch) {
        try {
            properties = JSON.parse(propertiesMatch[1].trim());
            console.log('[Gemini] Parsed properties:', properties);
        } catch (e) {
            console.warn('Failed to parse properties schema:', e);
        }
    }

    // If structured format found, use it
    if (codeMatch) {
        const code = codeMatch[1].trim();
        const css = cssMatch ? cssMatch[1].trim() : '';
        console.log('[Gemini] Extracted code (structured):', code.substring(0, 200));
        console.log('[Gemini] Extracted CSS:', css.substring(0, 200));

        return {
            code,
            css,
            explanation: content.split('[CODE]')[0].trim() || undefined,
            properties
        };
    }

    // Try to extract code blocks from markdown - look for all code blocks
    const allCodeBlocks = content.match(/```[\s\S]*?```/g);

    if (allCodeBlocks && allCodeBlocks.length > 0) {
        console.log('[Gemini] Found', allCodeBlocks.length, 'code blocks');

        let jsCode = '';
        let cssCode = '';

        // Process each code block
        for (const block of allCodeBlocks) {
            // Check if it's a CSS block
            if (block.match(/```css/i)) {
                const match = block.match(/```css\s*([\s\S]*?)```/i);
                if (match) {
                    cssCode = match[1].trim();
                    console.log('[Gemini] Found CSS block:', cssCode.substring(0, 100));
                }
            }
            // Otherwise treat as JavaScript/JSX
            else {
                const match = block.match(/```(?:jsx?|tsx?|javascript|typescript)?\s*([\s\S]*?)```/);
                if (match) {
                    jsCode = match[1].trim();
                    console.log('[Gemini] Found JS block:', jsCode.substring(0, 100));
                }
            }
        }

        if (jsCode) {
            console.log('[Gemini] Successfully extracted code from markdown blocks');
            return {
                code: jsCode,
                css: cssCode,
                explanation: content.split('```')[0].trim() || undefined,
                properties
            };
        }
    }

    // Last resort: try to find function Animation in the content
    const functionMatch = content.match(/function\s+Animation\s*\([^)]*\)\s*{[\s\S]*?^}/m);
    if (functionMatch) {
        console.log('[Gemini] Extracted code (function match):', functionMatch[0].substring(0, 200));
        return {
            code: functionMatch[0],
            css: '',
            explanation: undefined,
            properties
        };
    }

    // If all else fails, log the full content and throw error
    console.error('[Gemini] Failed to parse response.');
    console.error('[Gemini] Full content:', content);
    throw new Error('Failed to parse AI response. The model did not return code in the expected format.');
}

// Convert conversation history to Gemini format
function formatMessages(conversationHistory: Message[], newPrompt: string) {
    const contents = [];

    // Add system instruction as first user message
    contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will generate broadcast-quality React animations following the specified format.' }]
    });

    // Add conversation history
    for (const msg of conversationHistory) {
        if (msg.role === 'system') continue; // Skip system messages

        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    }

    // Add new user prompt
    contents.push({
        role: 'user',
        parts: [{ text: newPrompt }]
    });

    return contents;
}

export async function generateAnimationCode(
    prompt: string,
    _model: string, // Model parameter for consistency with OpenRouter, not used by Gemini
    conversationHistory: Message[] = []
): Promise<{ response: AIResponse; updatedHistory: Message[] }> {
    const apiKey = getApiKey();

    const contents = formatMessages(conversationHistory, prompt);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 16384  // Increased for complex animations
            }
        })
    });

    if (!response.ok) {
        let errorMessage = `Gemini API request failed with status ${response.status}`;

        try {
            const error = await response.json();
            if (error.error?.message) {
                errorMessage = error.error.message;
            }
        } catch (e) {
            // If we can't parse the error, use the default message
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();

    // Log the full response structure for debugging
    console.log('[Gemini] Full API response:', JSON.stringify(result, null, 2).substring(0, 1000));

    // Check if we have a valid candidate
    if (!result.candidates || result.candidates.length === 0) {
        console.error('[Gemini] No candidates in response:', result);
        throw new Error('Gemini API returned no candidates. The response may have been blocked.');
    }

    const candidate = result.candidates[0];

    // Check finish reason
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn('[Gemini] Unusual finish reason:', candidate.finishReason);
        if (candidate.finishReason === 'MAX_TOKENS') {
            throw new Error('Response was truncated due to length. Try simplifying your prompt or the animation will be incomplete.');
        } else if (candidate.finishReason === 'SAFETY') {
            console.error('[Gemini] Safety ratings:', candidate.safetyRatings);
            throw new Error('Response was blocked by safety filters. Try rephrasing your prompt.');
        } else if (candidate.finishReason === 'RECITATION') {
            throw new Error('Response was blocked due to recitation. Try a more original prompt.');
        }
    }

    // Extract the text
    const assistantMessage = candidate.content.parts[0].text;

    if (!assistantMessage || assistantMessage.length < 100) {
        console.error('[Gemini] Response too short:', assistantMessage);
        throw new Error('Gemini returned an unusually short response. Please try again.');
    }

    const parsedResponse = parseResponse(assistantMessage);

    // Build updated history
    const updatedHistory: Message[] = [
        ...conversationHistory,
        { role: 'user', content: prompt },
        { role: 'assistant', content: assistantMessage }
    ];

    return { response: parsedResponse, updatedHistory };
}

export async function refineAnimationCode(
    refinement: string,
    _model: string, // Model parameter for consistency with OpenRouter, not used by Gemini
    conversationHistory: Message[]
): Promise<{ response: AIResponse; updatedHistory: Message[] }> {
    // Refinement uses the same function but with existing history
    return generateAnimationCode(
        `Please refine the animation with the following changes: ${refinement}`,
        _model,
        conversationHistory
    );
}
