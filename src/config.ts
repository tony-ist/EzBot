import path from 'path'
import fs from 'fs'

let configFileContent = '{}'
try {
  const configPath = path.resolve(__dirname, '../config.json')
  configFileContent = fs.readFileSync(configPath).toString()
} catch (e: any) {
  if (e?.code === 'ENOENT') {
    console.error('There is no config.json file in project root. Please create it from config.template.json.')
  }
  throw e
}

const configJson = JSON.parse(configFileContent)
const config = configJson as Config

interface Config {
  wrongChannelAudioPath: string
  discordApiToken: string
  guildId: string
  clientId: string
  dbConnectionUrl: string
  dbName: string
  languageCode: 'en-US' | 'ru-RU'
  locale: 'en' | 'ru'
  botTimeout: number
  shouldRegisterSlashCommandsOnStart: boolean
}

export default config