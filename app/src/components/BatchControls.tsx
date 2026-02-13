import { Play, Pause, Square, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { ProcessingState } from '@/types'

interface BatchControlsProps {
    processingState: ProcessingState
    onStart: () => void
    onPause: () => void
    onStop: () => void
    onExport: () => void
    onClear: () => void
    totalCount: number
    completedCount: number
    canExport: boolean
    canStart: boolean
}

export function BatchControls({
    processingState,
    onStart,
    onPause,
    onStop,
    onExport,
    onClear,
    totalCount,
    completedCount,
    canExport,
    canStart
}: BatchControlsProps) {
    const isRunning = processingState.status === 'running'
    const isPaused = processingState.status === 'paused'
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                        {completedCount} / {totalCount}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
                {processingState.currentItem && (
                    <p className="text-xs text-muted-foreground truncate">
                        Processing: {processingState.currentItem}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                {!isRunning && !isPaused ? (
                    <Button 
                        onClick={onStart} 
                        className="col-span-2"
                        disabled={!canStart}
                    >
                        <Play className="h-4 w-4" />
                        Start Generation
                    </Button>
                ) : isRunning ? (
                    <>
                        <Button variant="secondary" onClick={onPause}>
                            <Pause className="h-4 w-4" />
                            Pause
                        </Button>
                        <Button variant="destructive" onClick={onStop}>
                            <Square className="h-4 w-4" />
                            Stop
                        </Button>
                    </>
                ) : (
                    <Button onClick={onStart} className="col-span-2">
                        <Play className="h-4 w-4" />
                        Resume
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button 
                    variant="outline" 
                    onClick={onExport}
                    disabled={!canExport}
                >
                    <Download className="h-4 w-4" />
                    Export ZIP
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={onClear}
                    disabled={totalCount === 0 || isRunning}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                </Button>
            </div>
        </div>
    )
}
