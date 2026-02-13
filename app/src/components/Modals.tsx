import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    count: number
}

export function DeleteConfirmModal({ open, onOpenChange, onConfirm, count }: DeleteConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Delete
                    </DialogTitle>
                    <DialogDescription>
                        This will permanently delete {count} image{count !== 1 ? 's' : ''} from the queue.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => {
                        onConfirm()
                        onOpenChange(false)
                    }}>
                        Delete All
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface ApiKeyModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    apiKey: string
    onApiKeyChange: (key: string) => void
}

export function ApiKeyModal({ open, onOpenChange, apiKey, onApiKeyChange }: ApiKeyModalProps) {
    const [tempKey, setTempKey] = useState(apiKey)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle>API Key Required</DialogTitle>
                    <DialogDescription>
                        Enter your Google Gemini API key to start generating images.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="w-full px-3 py-2 bg-secondary rounded-md border border-border focus:border-primary focus:outline-none"
                    />
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block"
                    >
                        Get an API key
                    </a>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        onApiKeyChange(tempKey)
                        onOpenChange(false)
                    }}>
                        Save & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
