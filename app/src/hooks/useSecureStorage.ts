import { useState, useEffect, useCallback } from 'react'

const ENCRYPTION_KEY = 'gemini-lora-dataset-gen'

function simpleEncrypt(text: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
            text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
    }
    return btoa(result)
}

function simpleDecrypt(encoded: string): string {
    try {
        const text = atob(encoded)
        let result = ''
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            )
        }
        return result
    } catch {
        return ''
    }
}

export function useSecureStorage(key: string) {
    const [value, setValueState] = useState<string>('')
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(key)
        if (stored) {
            setValueState(simpleDecrypt(stored))
        }
        setIsLoaded(true)
    }, [key])

    const setValue = useCallback((newValue: string) => {
        setValueState(newValue)
        if (newValue) {
            localStorage.setItem(key, simpleEncrypt(newValue))
        } else {
            localStorage.removeItem(key)
        }
    }, [key])

    const clearValue = useCallback(() => {
        setValueState('')
        localStorage.removeItem(key)
    }, [key])

    return { value, setValue, clearValue, isLoaded }
}
