import path from 'path'
import fs from 'fs'
import { LogLevel } from './types'

let configFileContent = '{}'
try {
  const configPath = path.resolve(__dirname, '../config.json')
  configFileContent = fs.readFileSync(configPath).toString()
} catch (e: any) {
  if (e?.code === 'ENOENT') {
    // eslint-disable-next-line no-console
    console.error('There is no config.json file in project root. Please create it from config.template.json.')
  }
  throw e
}

const configJson = JSON.parse(configFileContent)
const config = configJson as Config

interface Config {
  logLevel: LogLevel
  wrongChannelAudioPath: string
  discordApiToken: string
  guildId: string
  clientId: string
  dbConnectionUrl: string
  dbName: string
  languageCode: 'en-US' | 'ru-RU'
  locale: 'en' | 'ru'
  botTimeout: number
}

export default config
