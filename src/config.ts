import config from '../config.json'

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
}

export default config as Config

