import i18n from 'i18next'
import fs from 'fs'
import path from 'path'

const serverI18n = i18n.createInstance()

serverI18n.init({
    fallbackLng: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'es',
    supportedLngs: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'es,en').split(','),
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
})

function loadServerTranslations(lng: string, ns = 'common') {
    if (serverI18n.hasResourceBundle(lng, ns)) return
    const filePath = path.join(process.cwd(), 'public', 'locales', lng, `${ns}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    serverI18n.addResourceBundle(lng, ns, data)
}

export function t(key: string, lng = 'es') {
    loadServerTranslations(lng)
    return serverI18n.getFixedT(lng)(key)
}
