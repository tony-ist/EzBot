const fs = require('fs')

const configPath = './config.json'
const defaultConfig = {
  wrongChannelAudioPath: 'audio/wrongChannelEn.mp3',
  discordApiToken: '',
  serverId: '158305694506942465',
  dbConnectionUrl: 'mongodb://user:password@localhost:27017/database',
  dbName: 'ezbot',
  languageCode: 'en-US',
  locale: 'en'
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
}

module.exports = require(configPath)
