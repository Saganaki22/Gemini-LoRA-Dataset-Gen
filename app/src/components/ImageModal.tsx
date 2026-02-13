import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, FileText, Check, RefreshCw, Edit3, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { GeneratedImage } from '@/types'

interface ImageModalProps {
    image: GeneratedImage
    images: GeneratedImage[]
    onClose: () => void
    onNavigate: (direction: 'prev' | 'next') => void
    onUpdateCaption: (id: string, caption: string) => void
    onRerunCaption: (id: string) => void
    onRerunImage?: (id: string) => void
}

export function ImageModal({ 
    image, 
    images, 
    onClose, 
    onNavigate, 
    onUpdateCaption,
    onRerunCaption,
    onRerunImage
}: ImageModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(image.caption || '')
    const [hasChanges, setHasChanges] = useState(false)

    const currentIndex = images.findIndex((img) => img.id === image.id)
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < images.length - 1

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditing) return
            
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && hasPrev) {
                onNavigate('prev')
            } else if (e.key === 'ArrowRight' && hasNext) {
                onNavigate('next')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose, onNavigate, hasPrev, hasNext, isEditing])

    useEffect(() => {
        setEditText(image.caption || '')
        setIsEditing(false)
        setHasChanges(false)
    }, [image.id, image.caption])

    const handleSaveEdit = useCallback(() => {
        if (hasChanges) {
            onUpdateCaption(image.id, editText)
        }
        setIsEditing(false)
        setHasChanges(false)
    }, [hasChanges, image.id, editText, onUpdateCaption])

    const handleCancelEdit = useCallback(() => {
        setEditText(image.caption || '')
        setIsEditing(false)
        setHasChanges(false)
    }, [image.caption])

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditText(e.target.value)
        setHasChanges(e.target.value !== image.caption)
    }

    const handleStartEdit = () => {
        setEditText(image.caption || '')
        setIsEditing(true)
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={onClose}
        >
            <div 
                className="bg-card border border-border rounded-xl w-full max-w-6xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold truncate max-w-md">{image.name}</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {currentIndex + 1} / {images.length}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-black/50 flex items-center justify-center p-4">
                        {hasPrev && (
                            <button
                                onClick={() => onNavigate('prev')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}
                        {hasNext && (
                            <button
                                onClick={() => onNavigate('next')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}

                        <div className="max-w-full max-h-full">
                            {image.startImage && image.mode === 'pair' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <img 
                                            src={image.startImage} 
                                            alt="Start" 
                                            className="max-h-[70vh] object-contain rounded-lg"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm text-white font-medium">
                                            START
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <img 
                                            src={image.endImage} 
                                            alt="End" 
                                            className="max-h-[70vh] object-contain rounded-lg"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm text-white font-medium">
                                            END
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={image.endImage}
                                    alt={image.name}
                                    className="max-h-[70vh] object-contain rounded-lg"
                                />
                            )}
                        </div>
                    </div>

                    <div className="w-96 border-l border-border flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b border-border">
                            <h4 className="font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Caption
                            </h4>
                            <div className="flex items-center gap-1">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            className="text-green-500"
                                            disabled={!hasChanges}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleStartEdit}
                                            disabled={!image.caption}
                                        >
                                            <Edit3 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onRerunCaption(image.id)}
                                            title="Rerun Caption"
                                            disabled={image.status === 'processing'}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${image.status === 'processing' ? 'animate-spin' : ''}`} />
                                        </Button>
                                        {onRerunImage && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onRerunImage(image.id)}
                                                title="Regenerate Image"
                                                disabled={image.status === 'processing'}
                                            >
                                                <Image className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {isEditing ? (
                                <Textarea
                                    value={editText}
                                    onChange={handleTextChange}
                                    className="w-full h-full min-h-[200px] bg-secondary/50 border-border console-text resize-none focus:border-primary"
                                    autoFocus
                                />
                            ) : image.caption ? (
                                <pre className="text-sm console-text whitespace-pre-wrap break-words">
                                    {image.caption}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <FileText className="h-12 w-12 opacity-30 mb-2" />
                                    <p className="text-sm">No caption yet</p>
                                    <p className="text-xs mt-1">Generate to see caption</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span>Use ← → arrow keys to navigate</span>
                        <span>Press ESC to close</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" />
                        <span>Rerun caption</span>
                        <Image className="h-3 w-3 ml-2" />
                        <span>Regenerate image</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
