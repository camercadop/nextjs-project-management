import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/** Represents a single item in the breadcrumb navigation. */
export interface BreadcrumbItem {
    /** Display text for the breadcrumb segment. */
    label: string
    /** Optional link URL. If omitted, the item renders as the current page (non-clickable). */
    href?: string
}

/**
 * Renders a breadcrumb navigation bar.
 * The last item without an `href` is displayed as the active page.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
        >
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-foreground hover:underline">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}
