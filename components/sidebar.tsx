'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'

export function Sidebar() {
    const { theme, toggle } = useTheme()

    return (
        <aside className="w-64 border-r bg-background flex flex-col p-4 gap-2">
            <h1 className="text-lg font-bold mb-4">PM App</h1>
            <nav className="flex flex-col gap-1">
                <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-muted">
                    Dashboard
                </Link>
                <Link href="/workspaces" className="px-3 py-2 rounded hover:bg-muted">
                    Workspaces
                </Link>
            </nav>
            <div className="mt-auto">
                <button
                    onClick={toggle}
                    className="px-3 py-2 rounded hover:bg-muted w-full text-left"
                >
                    {theme === 'light' ? 'Dark' : 'Light'}
                </button>
            </div>
        </aside>
    )
}
