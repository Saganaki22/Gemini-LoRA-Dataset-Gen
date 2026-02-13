import { useState, useCallback, useRef } from 'react'
import type { GenerationConfig, GeneratedImage, ProcessingState } from '@/types'
import { generateImage, generateCaption, generateSingleImage, generateFromMultipleReferences } from '@/lib/gemini-api'
import { generateId, dataUrlToBase64, delay } from '@/lib/utils'

const MAX_RETRIES = 3
const RETRY_DELAY = 2000

export function useImageGenerator(
    config: GenerationConfig,
    addLog: (message: string, level?: 'info' | 'success' | 'warn' | 'error') => void
) {
    const [images, setImages] = useState<GeneratedImage[]>([])
    const [processingState, setProcessingState] = useState<ProcessingState>({
        status: 'idle',
        current: 0,
        total: 0
    })
    const abortRef = useRef(false)
    const pauseRef = useRef(false)

    const generatePairImages = useCallback(async (index: number): Promise<GeneratedImage> => {
        const id = String(index).padStart(4, '0')
        
        addLog(`Generating START image for pair ${index}...`, 'info')
        
        const startResult = await generateImage(config, 'start')
        
        if (abortRef.current) throw new Error('Aborted')
        
        addLog(`Generating END image for pair ${index}...`, 'info')
        
        const endResult = await generateImage(config, 'end', {
            data: dataUrlToBase64(startResult.imageUrl),
            mime: 'image/png'
        })
        
        if (abortRef.current) throw new Error('Aborted')
        
        addLog(`Generating caption for pair ${index}...`, 'info')
        
        const caption = await generateCaption(
            dataUrlToBase64(endResult.imageUrl),
            'image/png',
            config
        )
        
        return {
            id,
            name: `pair_${id}`,
            startImage: startResult.imageUrl,
            endImage: endResult.imageUrl,
            caption,
            status: 'done',
            mode: 'pair'
        }
    }, [config, addLog])

    const generateSingleWithCaption = useCallback(async (index: number): Promise<GeneratedImage> => {
        const id = String(index).padStart(4, '0')
        
        addLog(`Generating image ${index}...`, 'info')
        
        const result = await generateSingleImage(config)
        
        return {
            id,
            name: `image_${id}`,
            endImage: result.imageUrl,
            caption: result.caption,
            status: 'done',
            mode: 'single'
        }
    }, [config, addLog])

    const generateReferenceBased = useCallback(async (index: number): Promise<GeneratedImage> => {
        if (!config.referenceImages || config.referenceImages.length === 0) {
            throw new Error('No reference images provided')
        }
        
        const id = String(index).padStart(4, '0')
        
        addLog(`Generating variation ${index} from ${config.referenceImages.length} reference image(s)...`, 'info')
        
        const result = await generateFromMultipleReferences(config, config.referenceImages)
        
        return {
            id,
            name: `variation_${id}`,
            endImage: result.imageUrl,
            caption: result.caption,
            status: 'done',
            mode: 'reference'
        }
    }, [config, addLog])

    const processWithRetry = useCallback(async (
        index: number,
        generator: (index: number) => Promise<GeneratedImage>
    ): Promise<GeneratedImage> => {
        let attempt = 0
        
        while (attempt < MAX_RETRIES) {
            if (abortRef.current) throw new Error('Aborted')
            if (pauseRef.current) {
                await new Promise<void>((resolve) => {
                    const checkPause = setInterval(() => {
                        if (!pauseRef.current || abortRef.current) {
                            clearInterval(checkPause)
                            resolve()
                        }
                    }, 500)
                })
            }
            
            attempt++
            
            if (attempt > 1) {
                addLog(`Retrying image ${index} (attempt ${attempt}/${MAX_RETRIES})...`, 'warn')
                await delay(RETRY_DELAY)
            }
            
            try {
                return await generator(index)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                addLog(`Error on image ${index}: ${message}`, 'error')
                
                if (attempt >= MAX_RETRIES) {
                    throw error
                }
            }
        }
        
        throw new Error('Max retries exceeded')
    }, [addLog])

    const startGeneration = useCallback(async (mode: 'pair' | 'single' | 'reference') => {
        if (!config.apiKey) {
            addLog('No API key provided', 'error')
            return
        }
        
        abortRef.current = false
        pauseRef.current = false
        
        const total = config.numPairs
        const batchSize = Math.max(1, Math.min(10, config.batchSize))
        const generator = mode === 'pair' 
            ? generatePairImages 
            : mode === 'single' 
                ? generateSingleWithCaption 
                : generateReferenceBased
        
        setProcessingState({ status: 'running', current: 0, total })
        addLog(`Starting ${mode} generation for ${total} images (${batchSize} at a time)...`, 'info')
        
        const imageIds: string[] = []
        
        for (let i = 0; i < total; i++) {
            const imageId = generateId()
            imageIds.push(imageId)
            
            setImages((prev) => [
                ...prev,
                {
                    id: imageId,
                    name: `${mode}_${String(i + 1).padStart(4, '0')}`,
                    endImage: '',
                    caption: '',
                    status: 'pending',
                    mode
                }
            ])
        }
        
        let completedCount = 0
        
        for (let i = 0; i < total; i += batchSize) {
            if (abortRef.current) {
                addLog('Generation stopped by user', 'warn')
                break
            }
            
            const batch = imageIds.slice(i, Math.min(i + batchSize, total))
            
            setImages((prev) =>
                prev.map((img) =>
                    batch.includes(img.id) ? { ...img, status: 'processing' } : img
                )
            )
            
            addLog(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(total / batchSize)}...`, 'info')
            
            const results = await Promise.allSettled(
                batch.map(async (imageId, batchIndex) => {
                    const result = await processWithRetry(i + batchIndex + 1, generator)
                    return { imageId, result }
                })
            )
            
            results.forEach((result, index) => {
                const imageId = batch[index]
                
                if (result.status === 'fulfilled') {
                    const { result: genResult } = result.value
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === imageId ? { ...img, ...genResult, id: imageId, status: 'done' } : img
                        )
                    )
                    addLog(`Completed: ${genResult.name}`, 'success')
                } else {
                    const message = result.reason?.message || 'Unknown error'
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === imageId ? { ...img, status: 'error', error: message } : img
                        )
                    )
                    addLog(`Failed: ${message}`, 'error')
                }
                
                completedCount++
                setProcessingState((prev) => ({
                    ...prev,
                    current: completedCount,
                }))
            })
            
            if (i + batchSize < total && !abortRef.current) {
                await delay(300)
            }
        }
        
        setProcessingState((prev) => ({ ...prev, status: 'completed', currentItem: undefined }))
        addLog('Generation complete!', 'success')
    }, [config, generatePairImages, generateSingleWithCaption, generateReferenceBased, processWithRetry, addLog])

    const pauseGeneration = useCallback(() => {
        pauseRef.current = true
        setProcessingState((prev) => ({ ...prev, status: 'paused' }))
        addLog('Generation paused', 'warn')
    }, [addLog])

    const resumeGeneration = useCallback(() => {
        pauseRef.current = false
        setProcessingState((prev) => ({ ...prev, status: 'running' }))
        addLog('Generation resumed', 'info')
    }, [addLog])

    const stopGeneration = useCallback(() => {
        abortRef.current = true
        pauseRef.current = false
        setProcessingState((prev) => ({ ...prev, status: 'idle', currentItem: undefined }))
        addLog('Generation stopped', 'warn')
    }, [addLog])

    const clearImages = useCallback(() => {
        setImages([])
        setProcessingState({ status: 'idle', current: 0, total: 0 })
        addLog('Images cleared', 'info')
    }, [addLog])

    const updateCaption = useCallback((id: string, caption: string) => {
        setImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, caption } : img
            )
        )
        addLog(`Caption updated for ${id}`, 'success')
    }, [addLog])

    const rerunCaption = useCallback(async (id: string) => {
        const image = images.find(img => img.id === id)
        if (!image || !image.endImage) {
            addLog(`Cannot rerun caption: image not found or no image data`, 'error')
            return
        }

        if (processingState.status === 'running') {
            addLog(`Cannot rerun caption while processing`, 'warn')
            return
        }

        setImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, status: 'processing' as const } : img
            )
        )
        addLog(`Rerunning caption for ${id}...`, 'info')

        try {
            const imageData = dataUrlToBase64(image.endImage)
            const caption = await generateCaption(imageData, 'image/png', config)

            setImages((prev) =>
                prev.map((img) =>
                    img.id === id ? { ...img, caption, status: 'done' as const } : img
                )
            )
            addLog(`Caption regenerated for ${id}`, 'success')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            setImages((prev) =>
                prev.map((img) =>
                    img.id === id ? { ...img, status: 'error' as const, error: message } : img
                )
            )
            addLog(`Failed to regenerate caption for ${id}: ${message}`, 'error')
        }
    }, [images, config, processingState.status, addLog])

    const deleteImage = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id))
        addLog(`Deleted image ${id}`, 'info')
    }, [addLog])

    const rerunImage = useCallback(async (id: string) => {
        const image = images.find(img => img.id === id)
        if (!image) {
            addLog(`Cannot rerun: image not found`, 'error')
            return
        }

        if (processingState.status === 'running') {
            addLog(`Cannot rerun while processing`, 'warn')
            return
        }

        setImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, status: 'processing' as const, error: undefined } : img
            )
        )
        addLog(`Rerunning image generation for ${id}...`, 'info')

        try {
            let result: GeneratedImage

            if (image.mode === 'pair') {
                addLog(`Generating START image...`, 'info')
                const startResult = await generateImage(config, 'start')
                
                addLog(`Generating END image...`, 'info')
                const endResult = await generateImage(config, 'end', {
                    data: dataUrlToBase64(startResult.imageUrl),
                    mime: 'image/png'
                })
                
                addLog(`Generating caption...`, 'info')
                const caption = await generateCaption(
                    dataUrlToBase64(endResult.imageUrl),
                    'image/png',
                    config
                )
                
                result = {
                    id: image.id,
                    name: image.name,
                    startImage: startResult.imageUrl,
                    endImage: endResult.imageUrl,
                    caption,
                    status: 'done',
                    mode: 'pair'
                }
            } else if (image.mode === 'reference' && config.referenceImages && config.referenceImages.length > 0) {
                addLog(`Generating from ${config.referenceImages.length} reference(s)...`, 'info')
                const genResult = await generateFromMultipleReferences(config, config.referenceImages)
                
                result = {
                    id: image.id,
                    name: image.name,
                    endImage: genResult.imageUrl,
                    caption: genResult.caption,
                    status: 'done',
                    mode: 'reference'
                }
            } else {
                addLog(`Generating single image...`, 'info')
                const genResult = await generateSingleImage(config)
                
                result = {
                    id: image.id,
                    name: image.name,
                    endImage: genResult.imageUrl,
                    caption: genResult.caption,
                    status: 'done',
                    mode: image.mode
                }
            }

            setImages((prev) =>
                prev.map((img) =>
                    img.id === id ? { ...img, ...result } : img
                )
            )
            addLog(`Image regenerated: ${image.name}`, 'success')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            setImages((prev) =>
                prev.map((img) =>
                    img.id === id ? { ...img, status: 'error' as const, error: message } : img
                )
            )
            addLog(`Failed to regenerate image ${id}: ${message}`, 'error')
        }
    }, [images, config, processingState.status, addLog])

    return {
        images,
        processingState,
        startGeneration,
        pauseGeneration,
        resumeGeneration,
        stopGeneration,
        clearImages,
        updateCaption,
        rerunCaption,
        deleteImage,
        rerunImage
    }
}
