import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es'

if (!i18n.isInitialized) {
    i18n.use(HttpBackend)
        .use(initReactI18next)
        .init({
            fallbackLng: defaultLocale,
            supportedLngs: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'es,en').split(','),
            ns: ['common'],
            defaultNS: 'common',
            interpolation: { escapeValue: false },
            backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
        })
}

export const t = i18n.t.bind(i18n)
export { i18n }
