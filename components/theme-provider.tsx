'use client'

import { createContext, useContext, useEffect, useState } from 'react'

/** Supported theme values. */
type Theme = 'light' | 'dark'

/** @internal React context holding the current theme and toggle function. */
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
    theme: 'light',
    toggle: () => {},
})

/** Returns the current theme and a function to toggle between light/dark. */
export const useTheme = () => useContext(ThemeContext)

/**
 * Provides theme context to child components.
 * Reads initial preference from localStorage or system settings.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light'
        const stored = localStorage.getItem('theme') as Theme | null
        return stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
    }

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
