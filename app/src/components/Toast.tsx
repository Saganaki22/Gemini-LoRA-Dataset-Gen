import { useState } from 'react'
import { X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info'
}

interface ToastContainerProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg animate-slide-up",
                        toast.type === 'success' && "bg-green-600 text-white",
                        toast.type === 'error' && "bg-destructive text-white",
                        toast.type === 'info' && "bg-secondary text-foreground"
                    )}
                >
                    {toast.type === 'success' && <Check className="h-4 w-4" />}
                    {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
                    <span className="text-sm">{toast.message}</span>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="ml-2 hover:opacity-70"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return { toasts, addToast, removeToast }
}
