import JSZip from 'jszip'
import type { GeneratedImage } from '@/types'
import { dataUrlToBase64 } from '@/lib/utils'

export async function exportToZip(images: GeneratedImage[]): Promise<void> {
    const completedImages = images.filter((img) => img.status === 'done' && img.endImage)
    
    if (completedImages.length === 0) {
        throw new Error('No completed images to export')
    }
    
    const zip = new JSZip()
    
    for (const image of completedImages) {
        const baseName = image.name
        
        if (image.mode === 'pair' && image.startImage) {
            const startData = dataUrlToBase64(image.startImage)
            const endData = dataUrlToBase64(image.endImage)
            
            zip.file(`${baseName}_start.png`, Uint8Array.from(atob(startData), (c) => c.charCodeAt(0)), {
                binary: true
            })
            zip.file(`${baseName}_end.png`, Uint8Array.from(atob(endData), (c) => c.charCodeAt(0)), {
                binary: true
            })
            zip.file(`${baseName}.txt`, image.caption)
        } else {
            const imageData = dataUrlToBase64(image.endImage)
            
            zip.file(`${baseName}.png`, Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0)), {
                binary: true
            })
            zip.file(`${baseName}.txt`, image.caption)
        }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lora_dataset_${new Date().toISOString().slice(0, 10)}.zip`
    a.click()
    URL.revokeObjectURL(url)
}
