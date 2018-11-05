const fs = require('fs')

const configPath = './config.json'
const defaultConfig = {
  apiToken: '',
  serverId: '158305694506942465',
  yandexApiKey: '',
  dbUser: 'root',
  dbPassword: ''
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
}

module.exports = require(configPath)
