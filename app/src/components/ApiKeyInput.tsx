import { useState } from 'react'
import { Eye, EyeOff, Clipboard, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ApiKeyInputProps {
    value: string
    onChange: (value: string) => void
}

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
    const [showKey, setShowKey] = useState(false)
    const [pasted, setPasted] = useState(false)

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            onChange(text.trim())
            setPasted(true)
            setTimeout(() => setPasted(false), 1500)
        } catch {
            // Clipboard access denied
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    API Key
                </label>
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                    Get API Key
                </a>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative">
                        <Input
                            type={showKey ? 'text' : 'password'}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Enter your Gemini API key..."
                            className="pr-20 bg-secondary/50 border-border focus:border-primary"
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={handlePaste}
                            >
                                {pasted ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">Your Google Gemini API key. Stored encrypted locally in your browser. Required for image generation and captioning.</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
