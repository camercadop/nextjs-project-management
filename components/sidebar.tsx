'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { LayoutDashboard, FolderKanban, Sun, Moon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function Sidebar() {
    const { theme, toggle } = useTheme()
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        { href: '/workspaces', label: 'Workspaces', icon: FolderKanban },
    ]

    return (
        <aside className="w-64 border-r bg-sidebar flex flex-col">
            <div className="p-4">
                <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
                    ProjectHub
                </h1>
            </div>
            <Separator />
            <nav className="flex flex-col gap-1 p-3 flex-1">
                {navItems.map(item => {
                    const active = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
            <Separator />
            <div className="p-3 flex flex-col gap-1">
                <Button variant="ghost" size="sm" onClick={toggle} className="justify-start gap-2.5">
                    {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2.5 text-destructive hover:text-destructive"
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' })
                        router.push('/login')
                    }}
                >
                    <LogOut className="size-4" />
                    Logout
                </Button>
            </div>
        </aside>
    )
}
