const NextI18NextConfig = {
    i18n: {
        defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es',
        locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'es,en').split(",")
    },
    localePath: './public/locales'
}

export default NextI18NextConfig