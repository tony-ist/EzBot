const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config')

var argsRegexp = /[^\s"]+|"([^"]*)"/gi

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.Commands = {}

client.addCommand = function (commandName, callback, description) {
  client.Commands[commandName] = {
    name: commandName,
    callback: callback,
    description: description
  }
}

client.addCommand('ping', msg => {
  msg.reply('Pong!')
})

client.addCommand('say', (msg, args) => {
  msg.reply(args[0])
})

client.on('message', msg => {
  if (msg.content.indexOf('!') === 0) {
    let content = msg.content.split(' ')
    let commandName = content.shift().substring(1)
    console.log(commandName)
    if (!(commandName in client.Commands)) {
      return
    }
    let command = client.Commands[commandName]
    let argsStr = content.join(' ')
    var args = []
    do {
      var match = argsRegexp.exec(argsStr)
      if (match != null) {
        args.push(match[1] ? match[1] : match[0])
      }
    } while (match != null)
    command.callback(msg, args)
  }
})

client.login(config.apiToken)
