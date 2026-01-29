import type { Message, AIResponse, AIModel, PropertySchema } from '../types';
import { AI_MODELS } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt for animation code generation
const SYSTEM_PROMPT = `You are an expert React developer specializing in CSS animations and motion design.
Your task is to generate React components with beautiful CSS animations based on user descriptions.

ENVIRONMENT INFO:
- React and ReactDOM are available globally.
- Common hooks (useState, useEffect, etc.) are already destructured and available globally.
- You should define a component named 'Animation'.

RULES:
1. Generate ONLY valid React functional component code.
2. Use inline styles or include CSS in the [CSS] block.
3. The component must be self-contained within the [CODE] block.
4. Use CSS animations, keyframes, and transforms for motion.
5. The component should render immediately.
6. CRITICAL: Identify ALL adjustable parameters (colors, sizes, animation durations, texts, delays) in your code.
7. Define these parameters in a 'PARAMS' constant at the top of the code.
8. Create a corresponding JSON schema in a [PROPERTIES] block.

OUTPUT FORMAT (always follow this exactly):
[CODE]
// Define adjustable parameters
const PARAMS = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  size: 100,
  duration: 1.5,
  showText: true
};

// Define the Animation component
function Animation() {
  return (
    <div className="animation-container">
      {/* Your content using PARAMS.primaryColor, PARAMS.size, etc. */}
    </div>
  );
}

// Render the component to the #root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Animation />);
window.__rendered = true;
[/CODE]

[CSS]
/* Your CSS including @keyframes here */
.animation-container {
  /* styles */
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
    "id": "secondaryColor",
    "label": "Secondary Color",
    "type": "color",
    "value": "#10b981"
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
    "id": "showText",
    "label": "Show Text",
    "type": "boolean",
    "value": true
  }
]
[/PROPERTIES]

Always ensure the animation looks premium and polished. Use modern design principles like glassmorphism, smooth easing, and vibrant colors.`;

function getApiKey(): string {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key) {
        throw new Error('OpenRouter API key not found. Please add VITE_OPENROUTER_API_KEY to your .env file.');
    }
    return key;
}

// Parse AI response to extract code, CSS, and properties
function parseResponse(content: string): AIResponse {
    const codeMatch = content.match(/\[CODE\]([\s\S]*?)\[\/CODE\]/);
    const cssMatch = content.match(/\[CSS\]([\s\S]*?)\[\/CSS\]/);
    const propertiesMatch = content.match(/\[PROPERTIES\]([\s\S]*?)\[\/PROPERTIES\]/);

    let properties: PropertySchema[] | undefined;

    // Try to parse properties JSON
    if (propertiesMatch) {
        try {
            properties = JSON.parse(propertiesMatch[1].trim());
        } catch (e) {
            console.warn('Failed to parse properties schema:', e);
        }
    }

    // If no structured format, try to extract code blocks
    if (!codeMatch) {
        const jsxMatch = content.match(/```(?:jsx?|tsx?|javascript|typescript)?\s*([\s\S]*?)```/);
        const cssBlockMatch = content.match(/```css\s*([\s\S]*?)```/);

        return {
            code: jsxMatch ? jsxMatch[1].trim() : content,
            css: cssBlockMatch ? cssBlockMatch[1].trim() : '',
            explanation: content.split('```')[0].trim() || undefined,
            properties
        };
    }

    return {
        code: codeMatch[1].trim(),
        css: cssMatch ? cssMatch[1].trim() : '',
        explanation: content.split('[CODE]')[0].trim() || undefined,
        properties
    };
}

export async function generateAnimationCode(
    prompt: string,
    model: AIModel,
    conversationHistory: Message[] = []
): Promise<{ response: AIResponse; updatedHistory: Message[] }> {
    const apiKey = getApiKey();

    const modelId = (AI_MODELS as any)[model].id;

    const messages: Message[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: prompt }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Motion Studio'
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages.map(m => {
                const msg: Record<string, unknown> = {
                    role: m.role,
                    content: m.content
                };
                if (m.reasoning_details) {
                    msg.reasoning_details = m.reasoning_details;
                }
                return msg;
            }),
            reasoning: { enabled: true }
        })
    });

    if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;

        try {
            const error = await response.json();

            // Handle specific error codes
            if (response.status === 429) {
                errorMessage = 'Rate limit exceeded. Please wait a moment and try again, or try a different model.';
            } else if (response.status === 402) {
                errorMessage = 'This model requires payment or credits. Please try the GPT OSS 120b model instead, or add credits to your OpenRouter account.';
            } else if (response.status === 400) {
                errorMessage = error.error?.message || 'Invalid request. Please try a different prompt.';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }
        } catch (e) {
            // If we can't parse the error, use the default message
        }

        throw new Error(errorMessage);
    }

    const result = await response.json();
    const assistantMessage = result.choices[0].message;

    const parsedResponse = parseResponse(assistantMessage.content);

    // Build updated history preserving reasoning_details
    const updatedHistory: Message[] = [
        ...conversationHistory,
        { role: 'user', content: prompt },
        {
            role: 'assistant',
            content: assistantMessage.content,
            reasoning_details: assistantMessage.reasoning_details
        }
    ];

    return { response: parsedResponse, updatedHistory };
}

export async function refineAnimationCode(
    refinement: string,
    model: AIModel,
    conversationHistory: Message[]
): Promise<{ response: AIResponse; updatedHistory: Message[] }> {
    // Refinement uses the same function but with existing history
    return generateAnimationCode(
        `Please refine the animation with the following changes: ${refinement}`,
        model,
        conversationHistory
    );
}
