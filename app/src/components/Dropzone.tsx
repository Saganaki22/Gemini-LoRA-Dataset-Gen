import { useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropzoneProps {
    onFileSelect: (file: { data: string; mime: string; preview: string; name: string }) => void
    accept?: string
    className?: string
    disabled?: boolean
}

export function Dropzone({ onFileSelect, accept = 'image/*', className, disabled }: DropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const processFile = useCallback((file: File) => {
        const reader = new FileReader()
        reader.onload = () => {
            const dataUrl = reader.result as string
            const base64 = dataUrl.split(',')[1]
            onFileSelect({
                data: base64,
                mime: file.type,
                preview: dataUrl,
                name: file.name
            })
        }
        reader.readAsDataURL(file)
    }, [onFileSelect])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            processFile(file)
        }
    }, [processFile])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }, [processFile])

    return (
        <div
            className={cn(
                "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={() => !disabled && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary') }}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-primary')}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
                disabled={disabled}
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Drop reference image here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        </div>
    )
}
