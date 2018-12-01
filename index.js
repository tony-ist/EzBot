require('dotenv').config()
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const googleSpeech = require('@google-cloud/speech')
const config = require('./config')
const ConvertTo1ChannelStream = require('./convertTo1ChannelStream')

const argsRegexp = /[^\s"]+|"([^"]*)"/gi
const discordClient = new Discord.Client()
const googleSpeechClient = new googleSpeech.SpeechClient()

const yesWords = ['да', 'хорошо', 'давай', 'ок', 'окей', 'подтверждаю', 'согласен', 'хочу', 'ага', 'ответ положительный', 'перекинь']
const noWords = ['не надо', 'не подтверждаю', 'не согласен', 'не хочу', 'неверно', 'нет', 'не', 'отвали', 'ответ отрицательный', 'не хотим']
const meTooWords = ['меня', 'и меня', 'меня тоже']

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
  if (msg.author.presence && msg.author.presence.game) {
    msg.reply(msg.author.presence.game.name)
  } else {
    msg.reply('Ты не играешь ни в какую игру')
  }
})

async function start() {
  const mongoClient = await MongoClient.connect(config.dbConnectionUrl, { useNewUrlParser: true })

  console.log('Connected successfully to mongodb server')

  const db = mongoClient.db(config.dbName)

  discordClient.on('presenceUpdate', async (oldMember, newMember) => {
    const presence = newMember.presence
    const userVoiceChannel = newMember.voiceChannel

    if (!presence || !presence.game || !userVoiceChannel) {
      return
    }

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: presence.game.name })
    const channelId = gameAndChannel.channel

    if (!channelId || channelId === userVoiceChannel.id) {
      return
    }

    const connection = await userVoiceChannel.join()

    console.log('Joined voice channel')

    const dispatcher = connection.playFile(config.wrongChannelAudioPath)

    dispatcher.on('end', () => {
      console.log(dispatcher.time)

      const receiver = connection.createReceiver()
      setTimeout(() => {
        userVoiceChannel.leave()
      }, 30000)

      connection.on('speaking', (user, speaking) => {
        if (!speaking) {
          return
        }

        console.log(`I'm listening to ${user.username}`)

        // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
        const audioStream = receiver.createPCMStream(user)
        const config = {
          encoding: 'LINEAR16',
          sampleRateHertz: 48000,
          languageCode: 'ru-RU'
        }
        const request = {
          config: config
        }
        const recognizeStream = googleSpeechClient
          .streamingRecognize(request)
          .on('error', console.error)
          .on('data', response => {
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
            } else if (transcription === 'только меня') {
              newMember.guild.member(user).setVoiceChannel(channelId)
              userVoiceChannel.leave()
            } else if (meTooWords.indexOf(transcription) > -1) {
              newMember.guild.member(user).setVoiceChannel(channelId)
            }
          })

        const convertTo1ChannelStream = new ConvertTo1ChannelStream()

        audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)

        audioStream.on('end', async () => {
          console.log('audioStream end')
        })
      })
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

discordClient.login(config.discordApiToken)

start().catch(err => {
  console.error(err)
  process.exit(1)
})
