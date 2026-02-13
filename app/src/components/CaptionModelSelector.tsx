import { Crown, Zap, PiggyBank } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CAPTION_MODELS } from '@/lib/constants'
import type { CaptionModel } from '@/types'

function ModelIcon({ type, color }: { type: CaptionModel['icon']; color: string }) {
    const props = { className: 'h-4 w-4', style: { color } }
    switch (type) {
        case 'crown':
            return <Crown {...props} />
        case 'zap':
            return <Zap {...props} />
        case 'piggy-bank':
            return <PiggyBank {...props} />
    }
}

interface CaptionModelSelectorProps {
    value: string
    onChange: (value: string) => void
}

export function CaptionModelSelector({ value, onChange }: CaptionModelSelectorProps) {
    const selectedModel = CAPTION_MODELS.find((m) => m.id === value)

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Captioning Model
            </label>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="bg-secondary/50 border-border focus:border-primary">
                            <SelectValue>
                                {selectedModel && (
                                    <div className="flex items-center gap-2">
                                        <ModelIcon type={selectedModel.icon} color={selectedModel.iconColor} />
                                        <span>{selectedModel.name}</span>
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            {CAPTION_MODELS.map((model) => (
                                <SelectItem
                                    key={model.id}
                                    value={model.id}
                                    className="focus:bg-primary/10 focus:text-foreground"
                                >
                                    <div className="flex items-center gap-3 py-1">
                                        <ModelIcon type={model.icon} color={model.iconColor} />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{model.name}</span>
                                            <span className="text-xs text-muted-foreground">{model.description}</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">Select which Gemini model generates captions for your images. 3 Pro = highest quality, 2.5 Flash = fastest.</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
