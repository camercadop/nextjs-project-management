import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    i18n: {
        defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es',
        locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'es,en').split(','),
    },
}

export default nextConfig
