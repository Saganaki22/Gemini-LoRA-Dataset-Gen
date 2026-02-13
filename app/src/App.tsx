import { useState, useCallback, useEffect } from 'react'
import { Sparkles, Github } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ApiKeyInput } from '@/components/ApiKeyInput'
import { CaptionModelSelector } from '@/components/CaptionModelSelector'
import { ModeSelector } from '@/components/ModeSelector'
import { Console } from '@/components/Console'
import { BatchControls } from '@/components/BatchControls'
import { ImageGallery } from '@/components/ImageGallery'
import { ReferenceImageGrid } from '@/components/ReferenceImageGrid'
import { ToastContainer, useToast } from '@/components/Toast'
import { DeleteConfirmModal, ApiKeyModal } from '@/components/Modals'
import { SettingsModal } from '@/components/SettingsModal'
import { useSecureStorage } from '@/hooks/useSecureStorage'
import { useLogger } from '@/hooks/useLogger'
import { useImageGenerator } from '@/hooks/useImageGenerator'
import { exportToZip } from '@/hooks/useZipExport'
import { ASPECT_RATIOS, RESOLUTIONS, DEFAULT_SYSTEM_INSTRUCTIONS, DEFAULT_THEME_PROMPT, DEFAULT_TRANSFORMATION_PROMPT } from '@/lib/constants'
import type { GenerationMode, GenerationConfig, ReferenceImage } from '@/types'

function App() {
    const { value: apiKey, setValue: setApiKey, isLoaded: apiKeyLoaded } = useSecureStorage('gemini_api_key')
    
    const [mode, setMode] = useState<GenerationMode>('pair')
    const [captionModel, setCaptionModel] = useState('gemini-3-flash-preview')
    const [theme, setTheme] = useState(DEFAULT_THEME_PROMPT)
    const [transformation, setTransformation] = useState(DEFAULT_TRANSFORMATION_PROMPT)
    const [triggerWord, setTriggerWord] = useState('')
    const [aspectRatio, setAspectRatio] = useState('auto')
    const [resolution, setResolution] = useState('1K')
    const [numPairs, setNumPairs] = useState(5)
    const [parallelRequests, setParallelRequests] = useState(3)
    const [systemInstructions] = useState(DEFAULT_SYSTEM_INSTRUCTIONS)
    const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
    
    const [showApiKeyModal, setShowApiKeyModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    
    const { toasts, addToast, removeToast } = useToast()
    const { logs, addLog, clearLogs } = useLogger()
    
    const config: GenerationConfig = {
        apiKey,
        captionModel,
        theme,
        transformation,
        triggerWord,
        aspectRatio,
        resolution,
        batchSize: parallelRequests,
        numPairs,
        systemInstructions,
        referenceImages
    }
    
    const {
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
    } = useImageGenerator(config, addLog)
    
    useEffect(() => {
        if (apiKeyLoaded && !apiKey) {
            setShowApiKeyModal(true)
        }
    }, [apiKeyLoaded, apiKey])
    
    const handleStart = useCallback(() => {
        if (!apiKey) {
            setShowApiKeyModal(true)
            return
        }
        if (mode === 'reference' && referenceImages.length === 0) {
            addToast('Please upload at least one reference image', 'error')
            return
        }
        clearLogs()
        startGeneration(mode)
    }, [apiKey, mode, referenceImages, clearLogs, startGeneration, addToast])
    
    const handlePause = useCallback(() => {
        if (processingState.status === 'paused') {
            resumeGeneration()
        } else {
            pauseGeneration()
        }
    }, [processingState.status, pauseGeneration, resumeGeneration])
    
    const handleStop = useCallback(() => {
        stopGeneration()
    }, [stopGeneration])
    
    const handleExport = useCallback(async () => {
        try {
            await exportToZip(images)
            addToast('ZIP exported successfully!', 'success')
            addLog('ZIP exported successfully', 'success')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed'
            addToast(message, 'error')
            addLog(`Export failed: ${message}`, 'error')
        }
    }, [images, addToast, addLog])
    
    const handleClear = useCallback(() => {
        setShowDeleteModal(true)
    }, [])
    
    const confirmClear = useCallback(() => {
        clearImages()
        clearLogs()
        addToast('All images cleared', 'success')
    }, [clearImages, clearLogs, addToast])

    const handleSaveSettings = useCallback((newTheme: string, newTransformation: string, newTriggerWord: string) => {
        setTheme(newTheme)
        setTransformation(newTransformation)
        setTriggerWord(newTriggerWord)
        addLog('Settings updated', 'success')
    }, [addLog])
    
    const completedCount = images.filter((img) => img.status === 'done').length
    const canExport = completedCount > 0
    const canStart = Boolean(apiKey && (mode !== 'reference' || referenceImages.length > 0))
    
    const numberLabel = mode === 'pair' ? 'Pairs' : 'Images'
    
    if (!apiKeyLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }
    
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text">Gemini LoRA Dataset Gen</h1>
                                <p className="text-xs text-muted-foreground">Generate training datasets with AI</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                {images.length} images | {completedCount} completed
                            </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href="https://github.com/Saganaki22/Gemini-LoRA-Dataset-Gen"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                        >
                                            <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>View on GitHub</TooltipContent>
                                </Tooltip>
                        </div>
                    </div>
                </header>
                
                <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                        <aside className="space-y-4">
                            <div className="bg-card border border-border rounded-xl p-4">
                                <ApiKeyInput value={apiKey} onChange={setApiKey} />
                            </div>
                            
                            <div className="bg-card border border-border rounded-xl p-4">
                                <CaptionModelSelector value={captionModel} onChange={setCaptionModel} />
                            </div>
                            
                            <div className="bg-card border border-border rounded-xl p-4">
                                <ModeSelector value={mode} onChange={setMode} />
                            </div>
                            
                            <div 
                                className="bg-card border border-border rounded-xl p-4 space-y-4 cursor-pointer hover:border-primary/50 transition-all"
                                onClick={() => setShowSettingsModal(true)}
                            >
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {mode === 'pair' ? 'Dataset Theme' : mode === 'single' ? 'Style / Aesthetic' : 'Variation Theme'}
                                    </Label>
                                    <Textarea
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        placeholder={
                                            mode === 'pair' 
                                                ? "e.g., portraits of diverse people, landscape photography..."
                                                : mode === 'single'
                                                    ? "e.g., cyberpunk aesthetic, vintage film look..."
                                                    : "e.g., same character in different poses, same product different angles..."
                                        }
                                        className="bg-secondary/50 border-border focus:border-primary min-h-[60px] pointer-events-none"
                                        onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true) }}
                                    />
                                </div>
                                
                                {mode === 'pair' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Transformation to Learn
                                        </Label>
                                        <Textarea
                                            value={transformation}
                                            onChange={(e) => setTransformation(e.target.value)}
                                            placeholder="e.g., zoom out from close-up to full body, add dramatic lighting..."
                                            className="bg-secondary/50 border-border focus:border-primary min-h-[60px] pointer-events-none"
                                            onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true) }}
                                        />
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Trigger Word (optional)
                                    </Label>
                                    <Input
                                        value={triggerWord}
                                        onChange={(e) => setTriggerWord(e.target.value)}
                                        placeholder="e.g., MYZOOM, MYSTYLE..."
                                        className="bg-secondary/50 border-border focus:border-primary pointer-events-none"
                                        onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true) }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">Click any field to expand</p>
                            </div>
                            
                            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Tooltip>
                                        <TooltipTrigger className="w-full">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Resolution
                                                </Label>
                                                <Select value={resolution} onValueChange={setResolution}>
                                                    <SelectTrigger className="bg-secondary/50 border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {RESOLUTIONS.map((r) => (
                                                            <SelectItem key={r.value} value={r.value}>
                                                                {r.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Higher resolution = better quality but slower generation.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                        <TooltipTrigger className="w-full">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Aspect Ratio
                                                </Label>
                                                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                                    <SelectTrigger className="bg-secondary/50 border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ASPECT_RATIOS.map((r) => (
                                                            <SelectItem key={r.value} value={r.value}>
                                                                {r.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Auto lets the AI decide. Landscape = wider, Portrait = taller.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                <Tooltip>
                                    <TooltipTrigger className="w-full">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                Number of {numberLabel}
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={numPairs}
                                                onChange={(e) => setNumPairs(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="bg-secondary/50 border-border focus:border-primary"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Total {numberLabel.toLowerCase()} to generate
                                            </p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            {mode === 'pair' 
                                                ? "Each pair = 1 START + 1 END image + 1 caption"
                                                : "Each image will have a corresponding caption file"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                    <TooltipTrigger className="w-full">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                Parallel Requests
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={parallelRequests}
                                                onChange={(e) => setParallelRequests(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                                className="bg-secondary/50 border-border focus:border-primary"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Higher = faster but more API calls at once
                                            </p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">How many images to process simultaneously. Higher values are faster but use more API quota.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            
                            {mode === 'reference' && (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                        Reference Images (up to 6)
                                    </Label>
                                    <ReferenceImageGrid 
                                        images={referenceImages}
                                        onImagesChange={setReferenceImages}
                                        maxImages={6}
                                    />
                                </div>
                            )}
                            
                            <div className="bg-card border border-border rounded-xl p-4">
                                <BatchControls
                                    processingState={processingState}
                                    onStart={handleStart}
                                    onPause={handlePause}
                                    onStop={handleStop}
                                    onExport={handleExport}
                                    onClear={handleClear}
                                    totalCount={images.length}
                                    completedCount={completedCount}
                                    canExport={canExport}
                                    canStart={canStart}
                                />
                            </div>
                            
                            <Console logs={logs} />
                        </aside>
                        
                        <section className="bg-card border border-border rounded-xl p-4 min-h-[600px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Generated Images</h2>
                                <span className="text-sm text-muted-foreground">
                                    Mode: <span className="text-primary capitalize">{mode}</span>
                                </span>
                            </div>
                            
                            <ImageGallery 
                                images={images} 
                                onUpdateCaption={updateCaption}
                                onRerunCaption={rerunCaption}
                                onDelete={deleteImage}
                                onRerunImage={rerunImage}
                            />
                        </section>
                    </div>
                </main>
                
                <ToastContainer toasts={toasts} onRemove={removeToast} />
                
                <ApiKeyModal
                    open={showApiKeyModal}
                    onOpenChange={setShowApiKeyModal}
                    apiKey={apiKey}
                    onApiKeyChange={setApiKey}
                />
                
                <DeleteConfirmModal
                    open={showDeleteModal}
                    onOpenChange={setShowDeleteModal}
                    onConfirm={confirmClear}
                    count={images.length}
                />

                <SettingsModal
                    open={showSettingsModal}
                    onOpenChange={setShowSettingsModal}
                    mode={mode}
                    theme={theme}
                    transformation={transformation}
                    triggerWord={triggerWord}
                    onSave={handleSaveSettings}
                />
            </div>
        </TooltipProvider>
    )
}

export default App
