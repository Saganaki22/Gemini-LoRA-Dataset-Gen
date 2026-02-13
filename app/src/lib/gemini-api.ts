import type { GenerationConfig, ReferenceImage } from '@/types'
import { GENERATION_MODEL } from '@/lib/constants'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

interface ContentPart {
    text?: string
    inline_data?: { mime_type: string; data: string }
}

interface Payload {
    contents: Array<{
        parts: ContentPart[]
    }>
    generationConfig?: {
        responseModalities: string[]
        imageConfig: {
            image_size: string
            aspectRatio?: string
        }
    }
}

export async function generateImage(
    config: GenerationConfig,
    mode: 'start' | 'end',
    referenceData?: { data: string; mime: string }
): Promise<{ imageUrl: string; description: string }> {
    const prompt = buildGenerationPrompt(config, mode)
    
    const payload: Payload = {
        contents: [{
            parts: [
                { text: prompt }
            ]
        }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                image_size: config.resolution,
                ...(config.aspectRatio !== 'auto' && { aspectRatio: config.aspectRatio })
            }
        }
    }

    if (referenceData && mode === 'end') {
        payload.contents[0].parts.push({
            inline_data: {
                mime_type: referenceData.mime,
                data: referenceData.data
            }
        })
    }

    const response = await fetch(
        `${API_BASE}/${GENERATION_MODEL}:generateContent?key=${config.apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const json = await response.json()

    if (!json.candidates || !json.candidates[0]?.content) {
        throw new Error('Empty response from AI')
    }

    const parts = json.candidates[0].content.parts
    const imgPart = parts.find((p: Record<string, unknown>) => p.inlineData || p.inline_data)
    const textPart = parts.find((p: Record<string, unknown>) => p.text)

    if (!imgPart) {
        throw new Error('AI did not generate an image')
    }

    const raw = imgPart.inlineData || imgPart.inline_data
    const mimeType = raw.mimeType || raw.mime_type
    const imageUrl = `data:${mimeType};base64,${raw.data}`
    const description = textPart?.text?.substring(0, 100) || 'Generated'

    return { imageUrl, description }
}

function buildGenerationPrompt(config: GenerationConfig, mode: 'start' | 'end'): string {
    if (mode === 'start') {
        return `Create a START image: ${config.theme}. Subject: ${config.transformation}. Style: professional photography, clean composition.`
    } else {
        return `Create an END image showing the transformation: ${config.transformation}. Original theme: ${config.theme}. Maintain the same composition and subject identity.`
    }
}

export async function generateCaption(
    imageData: string,
    mimeType: string,
    config: GenerationConfig
): Promise<string> {
    const systemPrompt = config.systemInstructions || 
        'You are an expert image captioner. Describe the image in detail for machine learning training.'
    
    const userPrompt = config.triggerWord 
        ? `Start your response with "${config.triggerWord}". Then describe this image in detail.`
        : 'Describe this image in detail for training purposes.'

    const payload = {
        contents: [{
            role: 'user',
            parts: [
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: imageData
                    }
                },
                { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
        }]
    }

    const response = await fetch(
        `${API_BASE}/${config.captionModel}:generateContent?key=${config.apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const json = await response.json()
    const caption = json.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!caption.trim()) {
        throw new Error('Empty caption generated')
    }

    return caption
}

export async function generateSingleImage(
    config: GenerationConfig,
    referenceData?: { data: string; mime: string }
): Promise<{ imageUrl: string; caption: string }> {
    const payload: Payload = {
        contents: [{
            parts: [
                { text: `${config.theme}. ${config.transformation}` }
            ]
        }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                image_size: config.resolution,
                ...(config.aspectRatio !== 'auto' && { aspectRatio: config.aspectRatio })
            }
        }
    }

    if (referenceData) {
        payload.contents[0].parts.push({
            inline_data: {
                mime_type: referenceData.mime,
                data: referenceData.data
            }
        })
    }

    const response = await fetch(
        `${API_BASE}/${GENERATION_MODEL}:generateContent?key=${config.apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const json = await response.json()

    if (!json.candidates || !json.candidates[0]?.content) {
        throw new Error('Empty response from AI')
    }

    const parts = json.candidates[0].content.parts
    const imgPart = parts.find((p: Record<string, unknown>) => p.inlineData || p.inline_data)

    if (!imgPart) {
        throw new Error('AI did not generate an image')
    }

    const raw = imgPart.inlineData || imgPart.inline_data
    const mimeType = raw.mimeType || raw.mime_type
    const imageUrl = `data:${mimeType};base64,${raw.data}`

    const caption = await generateCaption(raw.data, mimeType, config)

    return { imageUrl, caption }
}

export async function generateFromMultipleReferences(
    config: GenerationConfig,
    referenceImages: ReferenceImage[]
): Promise<{ imageUrl: string; caption: string }> {
    const parts: ContentPart[] = [
        { text: `${config.theme}. ${config.transformation}` }
    ]

    referenceImages.forEach(img => {
        parts.push({
            inline_data: {
                mime_type: img.mime,
                data: img.data
            }
        })
    })

    const payload: Payload = {
        contents: [{
            parts
        }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                image_size: config.resolution,
                ...(config.aspectRatio !== 'auto' && { aspectRatio: config.aspectRatio })
            }
        }
    }

    const response = await fetch(
        `${API_BASE}/${GENERATION_MODEL}:generateContent?key=${config.apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const json = await response.json()

    if (!json.candidates || !json.candidates[0]?.content) {
        throw new Error('Empty response from AI')
    }

    const responseParts = json.candidates[0].content.parts
    const imgPart = responseParts.find((p: Record<string, unknown>) => p.inlineData || p.inline_data)

    if (!imgPart) {
        throw new Error('AI did not generate an image')
    }

    const raw = imgPart.inlineData || imgPart.inline_data
    const mimeType = raw.mimeType || raw.mime_type
    const imageUrl = `data:${mimeType};base64,${raw.data}`

    const caption = await generateCaption(raw.data, mimeType, config)

    return { imageUrl, caption }
}
