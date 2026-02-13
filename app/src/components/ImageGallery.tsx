import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ImageModal } from './ImageModal'
import { X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneratedImage } from '@/types'

interface ImageGalleryProps {
    images: GeneratedImage[]
    onImageClick?: (image: GeneratedImage) => void
    onUpdateCaption?: (id: string, caption: string) => void
    onRerunCaption?: (id: string) => void
    onRerunImage?: (id: string) => void
    onDelete?: (id: string) => void
}

export function ImageGallery({ 
    images, 
    onImageClick,
    onUpdateCaption,
    onRerunCaption,
    onRerunImage,
    onDelete
}: ImageGalleryProps) {
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

    const selectedImage = selectedImageId 
        ? images.find(img => img.id === selectedImageId) || null 
        : null

    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (!selectedImageId) return
        
        const currentIndex = images.findIndex(img => img.id === selectedImageId)
        if (currentIndex === -1) return

        let newIndex = currentIndex
        if (direction === 'prev' && currentIndex > 0) {
            newIndex = currentIndex - 1
        } else if (direction === 'next' && currentIndex < images.length - 1) {
            newIndex = currentIndex + 1
        }

        setSelectedImageId(images[newIndex].id)
    }, [images, selectedImageId])

    const handleUpdateCaption = useCallback((id: string, caption: string) => {
        onUpdateCaption?.(id, caption)
    }, [onUpdateCaption])

    const handleRerunCaption = useCallback((id: string) => {
        onRerunCaption?.(id)
    }, [onRerunCaption])

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="text-lg font-medium">No images generated yet</p>
                <p className="text-sm">Configure settings and click Start Generation</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className={cn(
                            "relative group rounded-lg overflow-hidden border border-border bg-card transition-all hover:scale-[1.02]",
                            image.status === 'processing' && "animate-pulse-glow"
                        )}
                    >
                        <div 
                            className="aspect-square relative cursor-pointer"
                            onClick={() => {
                                if (image.status !== 'processing') {
                                    setSelectedImageId(image.id)
                                    onImageClick?.(image)
                                }
                            }}
                        >
                            {image.status === 'processing' ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : image.status === 'error' ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                                    <p className="text-xs text-destructive text-center p-2">
                                        {image.error || 'Error'}
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={image.endImage}
                                    alt={image.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            
                            <StatusPill status={image.status} />
                            
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {image.status === 'error' && onRerunImage && (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-background/80 hover:bg-primary hover:text-black"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRerunImage(image.id)
                                        }}
                                        title="Retry"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-background/80 hover:bg-destructive hover:text-white"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDelete(image.id)
                                        }}
                                        title="Delete"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-2">
                            <p className="text-xs text-muted-foreground truncate">
                                {image.name}
                            </p>
                            {image.caption && (
                                <p className="text-xs text-foreground/70 truncate mt-1">
                                    {image.caption.substring(0, 50)}...
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    images={images}
                    onClose={() => setSelectedImageId(null)}
                    onNavigate={handleNavigate}
                    onUpdateCaption={handleUpdateCaption}
                    onRerunCaption={handleRerunCaption}
                    onRerunImage={onRerunImage}
                />
            )}
        </>
    )
}

function StatusPill({ status }: { status: GeneratedImage['status'] }) {
    const styles = {
        pending: 'bg-secondary text-secondary-foreground',
        processing: 'bg-primary text-primary-foreground',
        done: 'bg-green-600 text-white',
        error: 'bg-destructive text-destructive-foreground',
    }

    const labels = {
        pending: 'Pending',
        processing: 'Processing',
        done: 'Done',
        error: 'Error',
    }

    return (
        <div className={cn(
            "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium",
            styles[status]
        )}>
            {labels[status]}
        </div>
    )
}
