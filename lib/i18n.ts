import i18n from 'i18next'

/* Inicialización única */
async function bootstrap() {
    if ((i18n as any).isInitialized) return
    await i18n.init({
        fallbackLng: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: { escapeValue: false },
    })
}
bootstrap().catch(() => {}) // fire-and-forget

type TOpts = { locale?: string; fallback?: string }

function detectLocaleFromUrl(): string {
    try {
        if (typeof window !== 'undefined' && window.location?.href) {
            const u = new URL(window.location.href)
            const q = u.searchParams.get('lang')
            if (q) return q.split('-')[0]
        }
    } catch {}
    return process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es'
}

export function t(key: string | string[], opts: TOpts = {}): string {
    const keys = Array.isArray(key) ? key : [key]
    const locale = opts.locale ?? detectLocaleFromUrl()
    const fn = (i18n as any).isInitialized
        ? locale
            ? i18n.getFixedT(locale)
            : i18n.t.bind(i18n)
        : null

    for (const k of keys) {
        if (fn) {
            const res = (fn as any)(k)
            if (typeof res === 'string' && res !== k) return res
        }
    }
    return opts.fallback ?? keys[0] ?? ''
}

export { i18n }
