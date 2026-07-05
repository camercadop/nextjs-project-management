'use client'

import { createContext, useContext, useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
    theme: 'light',
    toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

/** Resolves theme from localStorage, falling back to OS preference. */
function getTheme(): Theme {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

/**
 * External store pattern: listeners are notified on toggle so
 * useSyncExternalStore triggers a re-render without useState.
 */
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
    listeners.add(cb)
    return () => { listeners.delete(cb) }
}

function getSnapshot(): Theme {
    return getTheme()
}

/** SSR fallback — avoids hydration mismatch by defaulting to light. */
function getServerSnapshot(): Theme {
    return 'light'
}

/**
 * Theme provider using useSyncExternalStore to avoid flash of wrong theme.
 * This bypasses React state so the DOM class updates synchronously before paint.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const toggle = useCallback(() => {
        const next: Theme = getTheme() === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        // Notify all useSyncExternalStore subscribers to re-render
        listeners.forEach(cb => cb())
    }, [])

    // Keep <html> class in sync — runs during render (not an effect) to avoid FOUC
    if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
