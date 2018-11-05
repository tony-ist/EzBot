require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const speech = require('@google-cloud/speech')
const yandexSpeech = require('yandex-speech')
const config = require('./config')
const convertTo1Channel = require('./convertTo1Channel')

let argsRegexp = /[^\s"]+|"([^"]*)"/gi
const client = new Discord.Client()
const speechClient = new speech.SpeechClient()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.Commands = {}

client.addCommand = function(name, callback, description) {
  client.Commands[name] = { name, callback, description }
}

client.addCommand('ping', msg => {
  msg.reply('Pong!')
})

client.addCommand('game', msg => {
  msg.reply(msg.author.presence.game.name)
})

const GameChannels = {
  'Visual Studio Code': '508227060938964992',
  'Mines': '508227060938964992'
}

function onPresenceUpdate(oldMember, newMember) {
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
      console.log('Joined voice channel')

      const playFilePath = 'samples/temp.mp3'

      yandexSpeech.TTS({
        developer_key: config.yandexApiKey,
        text: `Ей, ${newMember.user.username}`,
        file: playFilePath
      }, () => {
        const dispatcher = connection.playFile(playFilePath)
        dispatcher.on('end', () => {
          console.log(dispatcher.time)
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

        const receiver = connection.createReceiver()

        connection.on('speaking', (user, speaking) => {
          if (speaking) {
            console.log(`I'm listening to ${user}`)

            const tempOutPath = 'samples/tempOut.pcm'

            // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
            const audioStream = receiver.createPCMStream(user)
            // create an output stream so we can dump our data in a file
            const outputStream = fs.createWriteStream(tempOutPath)
            // pipe our audio data into the file stream
            audioStream.pipe(outputStream)
            outputStream.on('data', console.log)
            // when the stream ends (the user stopped talking) tell the user
            audioStream.on('end', () => {
              console.log('audioStream end')

              convertTo1Channel(tempOutPath)

              const file = fs.readFileSync(tempOutPath)
              const audioBytes = file.toString('base64')
              const audio = { content: audioBytes }
              const config = {
                encoding: 'LINEAR16',
                sampleRateHertz: 48000,
                languageCode: 'ru-RU'
              }
              const request = {
                audio: audio,
                config: config
              }

              speechClient
                .recognize(request)
                .then(data => {
                  const response = data[0]
                  const transcription = response.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n')
                  console.log(`Transcription: ${transcription}`)

                  const yesWords = ['да', 'хорошо']

                  if (yesWords.indexOf(transcription) > -1) {
                    console.log(`Moving member ${newMember} to channel ${channelId}`)
                    newMember.setVoiceChannel(channelId)
                  }

                  userVoiceChannel.leave()
                })
                .catch(err => {
                  console.error('ERROR:', err)
                })
            })
          }
        })
      })
    }).catch(console.error)
}

client.on('presenceUpdate', onPresenceUpdate)

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
