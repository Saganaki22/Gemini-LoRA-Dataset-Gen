import { useState, useCallback } from 'react'
import type { LogEntry } from '@/types'
import { generateId } from '@/lib/utils'

export function useLogger() {
    const [logs, setLogs] = useState<LogEntry[]>([])

    const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
        setLogs((prev) => [
            ...prev,
            {
                id: generateId(),
                message,
                level,
                timestamp: new Date()
            }
        ])
    }, [])

    const clearLogs = useCallback(() => {
        setLogs([])
    }, [])

    return { logs, addLog, clearLogs }
}
