import { useRef, useEffect, useState } from 'react'
import { cn, formatTimestamp } from '@/lib/utils'
import type { LogEntry } from '@/types'
import { X, Copy, Check } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface ConsoleProps {
    logs: LogEntry[]
    className?: string
}

const levelColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
}

export function Console({ logs, className }: ConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showModal, setShowModal] = useState(false)
    const [fontSize, setFontSize] = useState(12)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const handleCopy = async () => {
        const text = logs.map(log => 
            `[${formatTimestamp(log.timestamp)}] ${log.message}`
        ).join('\n')
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <div 
                className={cn(
                    "bg-black/50 rounded-lg border border-border cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]",
                    className
                )}
                onClick={() => setShowModal(true)}
            >
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Console
                    </h3>
                    <span className="text-xs text-muted-foreground">Click to expand</span>
                </div>
                <div 
                    ref={scrollRef}
                    className="h-40 overflow-y-auto p-3 console-text text-xs space-y-1"
                    style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                >
                    {logs.length === 0 ? (
                        <p className="text-muted-foreground">Waiting for logs...</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-2">
                                <span className="text-muted-foreground shrink-0">
                                    [{formatTimestamp(log.timestamp)}]
                                </span>
                                <span className={cn(levelColors[log.level])}>
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-card border border-border rounded-xl w-full max-w-4xl h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-semibold">Console Output</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setFontSize(Math.max(8, fontSize - 2))}
                                    >
                                        A
                                    </button>
                                    <Slider
                                        value={[fontSize]}
                                        onValueChange={([v]) => setFontSize(v)}
                                        min={8}
                                        max={24}
                                        step={1}
                                        className="w-24"
                                    />
                                    <button 
                                        className="text-lg font-bold text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                    >
                                        A
                                    </button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="gap-2"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowModal(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div 
                            className="flex-1 overflow-y-auto p-4"
                            style={{ 
                                fontFamily: 'Consolas, Monaco, monospace',
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.4,
                                color: '#00ff00'
                            }}
                        >
                            {logs.length === 0 ? (
                                <p className="text-muted-foreground">Waiting for logs...</p>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="flex gap-2 mb-1">
                                        <span className="text-muted-foreground shrink-0">
                                            [{formatTimestamp(log.timestamp)}]
                                        </span>
                                        <span className={cn(levelColors[log.level])}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
