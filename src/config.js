const fs = require('fs')
const { dirname } = require('path')

const path = dirname(require.main.filename)
const configPath = `${path}/../config.json`
const defaultConfig = {
  wrongChannelAudioPath: 'audio/wrongChannelEn.mp3',
  discordApiToken: '',
  guildId: '158305694506942465',
  clientId: '509809187757359124',
  dbConnectionUrl: 'mongodb://user:password@localhost:27017/database',
  dbName: 'ezbot',
  languageCode: 'en-US',
  locale: 'en',
  botTimeout: '40000',
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
}

module.exports = require(configPath)
