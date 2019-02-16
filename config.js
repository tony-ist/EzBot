const fs = require('fs')

const configPath = './config.json'
const defaultConfig = {
  wrongChannelAudioPath: 'audio/wrongChannel.mp3',
  discordApiToken: '',
  serverId: '158305694506942465',
  yandexApiKey: '',
  dbConnectionUrl: 'mongodb://user:password@localhost:27017/database',
  dbName: 'ezbot',
  locale: 'en'
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
}

module.exports = require(configPath)
