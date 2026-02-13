import { Layers, Image, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { GenerationMode } from '@/types'

interface ModeSelectorProps {
    value: GenerationMode
    onChange: (value: GenerationMode) => void
}

const modes: { value: GenerationMode; label: string; icon: React.ReactNode; description: string; tooltip: string }[] = [
    { 
        value: 'pair', 
        label: 'Pair', 
        icon: <Layers className="h-4 w-4" />,
        description: 'Generate START/END pairs',
        tooltip: 'Creates transformation pairs: a START image and an END image showing the transformation. Best for training LoRAs that learn specific changes.'
    },
    { 
        value: 'single', 
        label: 'Single', 
        icon: <Image className="h-4 w-4" />,
        description: 'Generate individual images',
        tooltip: 'Generates standalone images in a specific style or aesthetic. Best for style LoRAs without transformations.'
    },
    { 
        value: 'reference', 
        label: 'Reference', 
        icon: <Upload className="h-4 w-4" />,
        description: 'Generate from reference image',
        tooltip: 'Creates variations based on an uploaded reference image. Best for character consistency or product variations.'
    },
]

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Generation Mode
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/50 rounded-lg">
                {modes.map((mode) => {
                    const isSelected = value === mode.value
                    return (
                        <Tooltip key={mode.value}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => onChange(mode.value)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                        isSelected 
                                            ? "bg-primary text-black shadow-lg" 
                                            : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    {mode.icon}
                                    <span>{mode.label}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>{mode.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
            <p className="text-xs text-muted-foreground">
                {modes.find(m => m.value === value)?.description}
            </p>
        </div>
    )
}
