require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const googleSpeech = require('@google-cloud/speech')
const config = require('./config')
const convertTo1Channel = require('./convertTo1Channel')

const argsRegexp = /[^\s"]+|"([^"]*)"/gi
const discordClient = new Discord.Client()
const googleSpeechClient = new googleSpeech.SpeechClient()
const yesWords = ['да', 'хорошо', 'давай', 'ок', 'окей', 'подтверждаю', 'согласен', 'хочу', 'ага']
const noWords = ['не надо', 'не подтверждаю', 'не согласен', 'не хочу', 'неверно', 'нет', 'не']

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.Commands = {}

discordClient.addCommand = (name, callback, description) => {
  discordClient.Commands[name] = { name, callback, description }
}

discordClient.addCommand('ping', msg => {
  msg.reply('Pong!')
})

discordClient.addCommand('game', msg => {
  msg.reply(msg.author.presence.game.name)
})

async function start() {
  const mongoClient = await MongoClient.connect(config.dbConnectionUrl, { useNewUrlParser: true })

  console.log('Connected successfully to mongodb server')

  const db = mongoClient.db(config.dbName)

  const GamesAndChannels = await db.collection('GamesAndChannels').findOne({})

  discordClient.on('presenceUpdate', async (oldMember, newMember) => {
    const presence = newMember.presence
    const userVoiceChannel = newMember.voiceChannel

    if (!presence || !presence.game || !userVoiceChannel) {
      return
    }

    const channelId = GamesAndChannels[presence.game.name]

    if (!channelId || channelId === userVoiceChannel.id) {
      return
    }

    const connection = await userVoiceChannel.join()

    console.log('Joined voice channel')

    const playFilePath = 'audio/wrongChannel.mp3'
    const dispatcher = connection.playFile(playFilePath)

    dispatcher.on('end', () => {
      console.log(dispatcher.time)

      const receiver = connection.createReceiver()

      connection.on('speaking', (user, speaking) => {
        if (!speaking) {
          return
        }

        console.log(`I'm listening to ${user}`)

        const tempOutPath = 'samples/tempOut.pcm'
        // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
        const audioStream = receiver.createPCMStream(user)
        const outputStream = fs.createWriteStream(tempOutPath)

        audioStream.pipe(outputStream)

        outputStream.on('data', console.log)

        audioStream.on('end', async () => {
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

          const data = await googleSpeechClient.recognize(request)
          const response = data[0]
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n')
          console.log(`Transcription: ${transcription}`)

          if (yesWords.indexOf(transcription) > -1) {
            connection.channel.members.array().forEach(member => {
              if (member.user.id !== discordClient.user.id) {
                console.log(`Moving member ${member.displayName} to channel ${channelId}`)
                member.setVoiceChannel(channelId)
                userVoiceChannel.leave()
              }
            })
          } else if (noWords.indexOf(transcription) > -1) {
            userVoiceChannel.leave()
          }
        })
      })
    })

    dispatcher.on('debug', i => {
      console.log(i)
    })

    dispatcher.on('start', () => {
      console.log('playing')
    })

    dispatcher.once('error', errWithFile => {
      console.error('err with file: ' + errWithFile)
      return ('err with file: ' + errWithFile)
    })

    dispatcher.on('error', e => {
      console.error(e)
    })

    dispatcher.setVolume(1)

    console.log('done')
  })
}

discordClient.on('message', msg => {
  if (msg.content.indexOf('!') !== 0) {
    return
  }

  const content = msg.content.split(' ')
  const commandName = content.shift().substring(1)

  console.log(commandName)

  if (!(commandName in discordClient.Commands)) {
    return
  }

  const command = discordClient.Commands[commandName]
  const argsStr = content.join(' ')
  const args = []
  let match = null

  do {
    match = argsRegexp.exec(argsStr)
    if (match != null) {
      args.push(match[1] ? match[1] : match[0])
    }
  } while (match != null)

  command.callback(msg, args)
})

discordClient.login(config.apiToken)

start().catch(err => {
  console.error(err)
  process.exit(1)
})
