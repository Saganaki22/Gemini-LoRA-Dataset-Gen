import type { CaptionModel } from '@/types'

export const CAPTION_MODELS: CaptionModel[] = [
    {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro',
        description: 'Most intelligent, premium quality',
        icon: 'crown',
        iconColor: '#e74c3c',
    },
    {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash',
        description: 'Best balance of speed & quality',
        icon: 'zap',
        iconColor: '#f39c12',
    },
    {
        id: 'gemini-flash-latest',
        name: 'Gemini 2.5 Flash',
        description: 'Fastest & most economical',
        icon: 'piggy-bank',
        iconColor: '#2ecc71',
    },
]

export const GENERATION_MODEL = 'gemini-3-pro-image-preview'

export const ASPECT_RATIOS = [
    { value: 'auto', label: 'Auto' },
    { value: '1:1', label: '1:1 Square' },
    { value: '16:9', label: '16:9 Landscape' },
    { value: '9:16', label: '9:16 Portrait' },
    { value: '4:3', label: '4:3 Landscape' },
    { value: '3:4', label: '3:4 Portrait' },
    { value: '5:4', label: '5:4 Landscape' },
    { value: '4:5', label: '4:5 Portrait' },
]

export const RESOLUTIONS = [
    { value: '1K', label: '1K Resolution' },
    { value: '2K', label: '2K High Quality' },
]

export const DEFAULT_SYSTEM_INSTRUCTIONS = `You are a specialized visual analysis engine designed for high-fidelity data annotation. Your goal is to generate a dense, structured textual description of input images, optimized for machine learning training and visual indexing.

**Output Protocol:**
- **Format:** Produce exactly one continuous paragraph (150-400 words).
- **Tone:** Use strict, evidence-based description. Focus only on visible features.
- **Certainty:** If precise identification is impossible, use qualifiers like "appears to be," "resembling," or "likely" rather than guessing.
- **Prohibitions:** Do not use meta-phrases ("This image shows," "in the frame"). Do not use emotional or aesthetic adjectives ("beautiful," "disturbing," "inspiring").

**Prioritization Hierarchy:**
Structure your paragraph to flow strictly in this order:
1. **Primary Subject (Highest Priority):** The central focus, action, and physical details.
2. **Spatial Context:** The environment, background, and relationships between objects.
3. **Technical & Aesthetic Qualities:** Lighting, medium, artistic style, and camera attributes.`

export const DEFAULT_THEME_PROMPT = 'High-end photography, professional lighting, clean composition'

export const DEFAULT_TRANSFORMATION_PROMPT = 'Transform the subject with the specified style while maintaining core identity'
