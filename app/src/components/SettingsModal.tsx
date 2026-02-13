import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { GenerationMode } from '@/types'

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: GenerationMode
    theme: string
    transformation: string
    triggerWord: string
    onSave: (theme: string, transformation: string, triggerWord: string) => void
}

export function SettingsModal({
    open,
    onOpenChange,
    mode,
    theme,
    transformation,
    triggerWord,
    onSave
}: SettingsModalProps) {
    const [tempTheme, setTempTheme] = useState(theme)
    const [tempTransformation, setTempTransformation] = useState(transformation)
    const [tempTriggerWord, setTempTriggerWord] = useState(triggerWord)
    const [fontSize, setFontSize] = useState(16)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (open) {
            setTempTheme(theme)
            setTempTransformation(transformation)
            setTempTriggerWord(triggerWord)
            setHasChanges(false)
        }
    }, [open, theme, transformation, triggerWord])

    useEffect(() => {
        const changed = tempTheme !== theme || 
                       tempTransformation !== transformation || 
                       tempTriggerWord !== triggerWord
        setHasChanges(changed)
    }, [tempTheme, tempTransformation, tempTriggerWord, theme, transformation, triggerWord])

    const handleClose = () => {
        if (hasChanges) {
            onSave(tempTheme, tempTransformation, tempTriggerWord)
        }
        onOpenChange(false)
    }

    const getLabelName = () => {
        switch (mode) {
            case 'pair': return 'Dataset Theme'
            case 'single': return 'Style / Aesthetic'
            case 'reference': return 'Variation Theme'
        }
    }

    const getPlaceholder = () => {
        switch (mode) {
            case 'pair': 
                return 'e.g., portraits of diverse people, landscape photography...'
            case 'single': 
                return 'e.g., cyberpunk aesthetic, vintage film look...'
            case 'reference': 
                return 'e.g., same character in different poses, same product different angles...'
        }
    }

    if (!open) return null

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-card border border-border rounded-xl w-full max-w-4xl h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <h3 className="text-lg font-semibold">Generation Settings</h3>
                    <div className="flex items-center gap-6">
                        {hasChanges && (
                            <span className="text-sm text-primary flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Auto-saves on close
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Font Size:</span>
                            <button 
                                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                            >
                                A
                            </button>
                            <Slider
                                value={[fontSize]}
                                onValueChange={([v]) => setFontSize(v)}
                                min={12}
                                max={24}
                                step={1}
                                className="w-32"
                            />
                            <button 
                                className="text-xl font-bold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                            >
                                A
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={handleClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6 min-h-0">
                    {mode === 'pair' ? (
                        <div className="flex-1 grid grid-cols-1 gap-6 min-h-0">
                            <div className="flex flex-col min-h-0 flex-[2]">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">
                                    {getLabelName()}
                                </Label>
                                <Textarea
                                    value={tempTheme}
                                    onChange={(e) => setTempTheme(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    className="flex-1 bg-secondary/50 border-border focus:border-primary p-4 resize-none min-h-0"
                                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                                />
                            </div>
                            <div className="flex flex-col min-h-0 flex-[2]">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">
                                    Transformation to Learn
                                </Label>
                                <Textarea
                                    value={tempTransformation}
                                    onChange={(e) => setTempTransformation(e.target.value)}
                                    placeholder="e.g., zoom out from close-up to full body, add dramatic lighting..."
                                    className="flex-1 bg-secondary/50 border-border focus:border-primary p-4 resize-none min-h-0"
                                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                                />
                            </div>
                            <div className="shrink-0">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    Trigger Word (optional)
                                </Label>
                                <Input
                                    value={tempTriggerWord}
                                    onChange={(e) => setTempTriggerWord(e.target.value)}
                                    placeholder="e.g., MYZOOM, MYSTYLE..."
                                    className="bg-secondary/50 border-border focus:border-primary h-12 px-4"
                                    style={{ fontSize: `${fontSize}px` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-6 min-h-0">
                            <div className="flex-1 flex flex-col min-h-0">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">
                                    {getLabelName()}
                                </Label>
                                <Textarea
                                    value={tempTheme}
                                    onChange={(e) => setTempTheme(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    className="flex-1 bg-secondary/50 border-border focus:border-primary p-4 resize-none min-h-0"
                                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                                />
                            </div>
                            <div className="shrink-0">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    Trigger Word (optional)
                                </Label>
                                <Input
                                    value={tempTriggerWord}
                                    onChange={(e) => setTempTriggerWord(e.target.value)}
                                    placeholder="e.g., MYZOOM, MYSTYLE..."
                                    className="bg-secondary/50 border-border focus:border-primary h-12 px-4"
                                    style={{ fontSize: `${fontSize}px` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-3 border-t border-border bg-secondary/30 text-sm text-muted-foreground text-center shrink-0">
                    Changes auto-save when you close this modal
                </div>
            </div>
        </div>
    )
}
