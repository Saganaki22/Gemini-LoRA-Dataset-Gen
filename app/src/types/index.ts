export type GenerationMode = 'pair' | 'single' | 'reference';

export type ImageStatus = 'pending' | 'processing' | 'done' | 'error';

export interface GeneratedImage {
    id: string;
    name: string;
    startImage?: string;
    endImage: string;
    caption: string;
    status: ImageStatus;
    error?: string;
    mode: GenerationMode;
}

export interface CaptionModel {
    id: string;
    name: string;
    description: string;
    icon: 'crown' | 'zap' | 'piggy-bank';
    iconColor: string;
}

export interface ReferenceImage {
    id: string;
    data: string;
    mime: string;
    preview: string;
    name: string;
}

export interface GenerationConfig {
    apiKey: string;
    captionModel: string;
    theme: string;
    transformation: string;
    triggerWord: string;
    aspectRatio: string;
    resolution: string;
    batchSize: number;
    numPairs: number;
    systemInstructions: string;
    referenceImages: ReferenceImage[];
}

export interface ProcessingState {
    status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
    current: number;
    total: number;
    currentItem?: string;
}

export interface LogEntry {
    id: string;
    message: string;
    level: 'info' | 'success' | 'warn' | 'error';
    timestamp: Date;
}
