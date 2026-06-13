import { i18n } from '@/lib/i18n'
import fs from 'fs'
import path from 'path'

function loadServerTranslations(lng: string, ns = 'common') {
    if (i18n.hasResourceBundle(lng, ns)) return
    const filePath = path.join(process.cwd(), 'public', 'locales', lng, `${ns}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    i18n.addResourceBundle(lng, ns, data)
}

export function t(key: string, lng = 'es') {
    loadServerTranslations(lng)

    return i18n.getFixedT(lng)(key)
}
