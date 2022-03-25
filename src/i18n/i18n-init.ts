import { I18n } from 'i18n'
import * as path from 'path'
import config from '../../config.json'

const i18n = new I18n()

i18n.configure({
  locales: ['en', 'ru'],
  directory: path.join(__dirname, '..', '..', 'locales'),
  updateFiles: false,
})

i18n.setLocale(config.locale)
console.log(`Locale is: ${config.locale}`)

export default i18n
