'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
    theme: 'light',
    toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null
        const initialTheme =
            storedTheme ??
            (window.matchMedia('(prefers-color-schema: dark)').matches ? 'dark' : 'light')
        setTheme(initialTheme)
        document.documentElement.classList.toggle('dark', initialTheme == 'dark')
    }, [])

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
    }

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
