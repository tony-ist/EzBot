const Discord = require('discord.js')
const config = require('./config')
const yandexSpeech = require('yandex-speech')

let argsRegexp = /[^\s"]+|"([^"]*)"/gi
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.Commands = {}

client.addCommand = function (name, callback, description) {
  client.Commands[name] = { name, callback, description }
}

client.addCommand('ping', msg => {
  msg.reply('Pong!')
})

client.addCommand('game', msg => {
  msg.reply(msg.author.presence.game.name)
})

let GameChannels = {
  'Visual Studio Code': '508227060938964992'
}

client.on('presenceUpdate', (oldMember, newMember) => {
  let presence = newMember.presence
  let userVoiceChannel = newMember.voiceChannel
  if (!presence || !presence.game || !userVoiceChannel) {
    return
  }
  let channelId = GameChannels[presence.game.name]
  if (!channelId || channelId === userVoiceChannel.id) {
    return
  }
  userVoiceChannel.join()
    .then(connection => {
      yandexSpeech.TTS({
        developer_key: config.yandexApiKey,
        text: `Ей, ${newMember.user.username}`,
        file: 'temp.mp3'
      }, () => {
        const dispatcher = connection.playFile('temp.mp3')
        dispatcher.on('end', () => {
          console.log(dispatcher.time)
          setTimeout(() => {
            userVoiceChannel.leave()
          }, 2000)
        })
        dispatcher.on('debug', i => {
          console.log(i)
        })
        dispatcher.on('start', () => {
          console.log('playing')
        })
        dispatcher.once('error', errWithFile => {
          console.log('err with file: ' + errWithFile)
          return ('err with file: ' + errWithFile)
        })
        dispatcher.on('error', e => {
          console.log(e)
        })
        dispatcher.setVolume(1)
        console.log('done')
      })
    }).catch(console.error)
})

client.on('message', msg => {
  if (msg.content.indexOf('!') !== 0) {
    return
  }

  let content = msg.content.split(' ')
  let commandName = content.shift().substring(1)

  console.log(commandName)

  if (!(commandName in client.Commands)) {
    return
  }

  let command = client.Commands[commandName]
  let argsStr = content.join(' ')
  let args = []
  let match = null

  do {
    match = argsRegexp.exec(argsStr)
    if (match != null) {
      args.push(match[1] ? match[1] : match[0])
    }
  } while (match != null)

  command.callback(msg, args)
})

client.login(config.apiToken)
