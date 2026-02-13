import { useState, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReferenceImage } from '@/types'
import { cn, generateId } from '@/lib/utils'

interface ReferenceImageGridProps {
    images: ReferenceImage[]
    onImagesChange: (images: ReferenceImage[]) => void
    maxImages?: number
}

export function ReferenceImageGrid({ 
    images, 
    onImagesChange,
    maxImages = 6 
}: ReferenceImageGridProps) {
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
    const processingRef = useRef<boolean>(false)

    const selectedImage = selectedImageId 
        ? images.find(img => img.id === selectedImageId) || null 
        : null

    const currentIndex = selectedImageId 
        ? images.findIndex(img => img.id === selectedImageId) 
        : -1
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < images.length - 1

    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (!selectedImageId) return
        
        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
        if (newIndex >= 0 && newIndex < images.length) {
            setSelectedImageId(images[newIndex].id)
        }
    }, [selectedImageId, currentIndex, images])

    const handleDelete = useCallback((id: string) => {
        onImagesChange(images.filter(img => img.id !== id))
        if (selectedImageId === id) {
            setSelectedImageId(null)
        }
    }, [images, onImagesChange, selectedImageId])

    const handleFiles = useCallback((files: FileList | File[]) => {
        if (processingRef.current) return
        
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
        const remainingSlots = maxImages - images.length
        if (remainingSlots <= 0) return
        
        const filesToProcess = fileArray.slice(0, remainingSlots)
        if (filesToProcess.length === 0) return

        processingRef.current = true
        const newImages: ReferenceImage[] = []
        let processedCount = 0

        filesToProcess.forEach(file => {
            const reader = new FileReader()
            reader.onload = () => {
                const dataUrl = reader.result as string
                const base64 = dataUrl.split(',')[1]
                newImages.push({
                    id: generateId(),
                    data: base64,
                    mime: file.type,
                    preview: dataUrl,
                    name: file.name
                })
                
                processedCount++
                if (processedCount === filesToProcess.length) {
                    onImagesChange([...images, ...newImages])
                    processingRef.current = false
                }
            }
            reader.onerror = () => {
                processedCount++
                if (processedCount === filesToProcess.length) {
                    onImagesChange([...images, ...newImages])
                    processingRef.current = false
                }
            }
            reader.readAsDataURL(file)
        })
    }, [images, maxImages, onImagesChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.currentTarget.classList.remove('border-primary')
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }, [handleFiles])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
            e.target.value = ''
        }
    }, [handleFiles])

    return (
        <>
            <div 
                className={cn(
                    "border-2 border-dashed border-border rounded-lg p-3 transition-colors relative",
                    images.length < maxImages && "hover:border-primary hover:bg-primary/5 cursor-pointer"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary') }}
                onDragLeave={(e) => e.currentTarget.classList.remove('border-primary')}
                onClick={() => {
                    if (images.length < maxImages) {
                        document.getElementById('reference-file-input')?.click()
                    }
                }}
            >
                <input
                    id="reference-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                    className="hidden"
                />
                
                <div className="grid grid-cols-3 gap-2">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImageId(image.id)
                            }}
                        >
                            <img
                                src={image.preview}
                                alt={image.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(image.id)
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    
                    {images.length < maxImages && (
                        <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center pointer-events-none">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">
                                {images.length}/{maxImages}
                            </span>
                        </div>
                    )}
                </div>
                
                {images.length > 0 && images.length < maxImages && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Click or drop to add more • Click image to view
                    </p>
                )}
                
                {images.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Click or drag images here (up to {maxImages})
                    </p>
                )}
            </div>

            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setSelectedImageId(null)}
                >
                    <div className="relative max-w-4xl w-full">
                        {hasPrev && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNavigate('prev') }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}
                        {hasNext && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNavigate('next') }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-primary hover:text-black flex items-center justify-center transition-colors z-10"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}

                        <img
                            src={selectedImage.preview}
                            alt={selectedImage.name}
                            className="w-full max-h-[80vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="text-sm text-white bg-black/50 px-3 py-1 rounded">
                                {currentIndex + 1} / {images.length}
                            </span>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(selectedImage.id)}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedImageId(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white bg-black/50 px-3 py-1 rounded">
                            {selectedImage.name}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
