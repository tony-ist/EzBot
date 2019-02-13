require('dotenv').config()
const DbManagement = require('./commands/DbManagement')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const googleSpeech = require('@google-cloud/speech')
const config = require('./config')
const ConvertTo1ChannelStream = require('./convertTo1ChannelStream')
const Dispatcher = require('./promised/Dispatcher')

const argsRegexp = /[^\s"]+|"([^"]*)"/gi
const discordClient = new Discord.Client()
const googleSpeechClient = new googleSpeech.SpeechClient()

const yesWords = ['да', 'хорошо', 'давай', 'ок', 'окей', 'подтверждаю', 'согласен', 'хочу', 'ага', 'ответ положительный', 'перекинь']
const noWords = ['не надо', 'не подтверждаю', 'не согласен', 'не хочу', 'неверно', 'нет', 'не', 'отвали', 'ответ отрицательный', 'не хотим']
const meTooWords = ['меня', 'и меня', 'меня тоже']
let isBotInVoiceChannel = false

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.Commands = {}

discordClient.addCommand = (name, callback, description) => {
  discordClient.Commands[name] = { name, callback, description }
}

discordClient.addCommand('ping', message => {
  message.reply('Pong!')
}, 'Бот отвечает Pong!')

discordClient.addCommand('game', message => {
  if (message.author.presence && message.author.presence.game) {
    message.reply(message.author.presence.game.name)
  } else {
    message.reply('Ты не играешь ни в какую игру')
  }
}, 'Отображает название игры, в которую ты играешь.')

discordClient.addCommand('help', message => {
  let reply = 'Помощь по командам бота:\n'

  for (const name in discordClient.Commands) {
    reply += `\`!${name}\`: ${discordClient.Commands[name].description || ''}\n`
  }

  message.reply(reply)
}, 'Отображает помощь по командам.')

async function summon(db, member) {
  const presence = member.presence
  const userVoiceChannel = member.voiceChannel
  const isUserAfk = userVoiceChannel && userVoiceChannel.id === member.guild.afkChannelID

  if (!presence || !presence.game || !userVoiceChannel || isBotInVoiceChannel || isUserAfk) {
    return
  }

  const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: presence.game.name })
  const channelId = gameAndChannel.channel

  if (!channelId || channelId === userVoiceChannel.id) {
    return
  }

  const connection = await userVoiceChannel.join()
  isBotInVoiceChannel = true
  console.log(`Joined voice channel ${userVoiceChannel.name}`)

  await Dispatcher.playFile(connection, config.wrongChannelAudioPath)

  setTimeout(() => {
    isBotInVoiceChannel = false
    userVoiceChannel.leave()
  }, 30000)

  const receiver = connection.createReceiver()

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
              isBotInVoiceChannel = false
              userVoiceChannel.leave()
            }
          })
        } else if (noWords.indexOf(transcription) > -1) {
          isBotInVoiceChannel = false
          userVoiceChannel.leave()
        } else if (transcription === 'только меня') {
          member.guild.member(user).setVoiceChannel(channelId)
          isBotInVoiceChannel = false
          userVoiceChannel.leave()
        } else if (meTooWords.indexOf(transcription) > -1) {
          member.guild.member(user).setVoiceChannel(channelId)
        }
      })

    const convertTo1ChannelStream = new ConvertTo1ChannelStream()

    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)

    audioStream.on('end', async () => {
      console.log('audioStream end')
    })
  })
}

async function start() {
  const mongoClient = await MongoClient.connect(config.dbConnectionUrl, { useNewUrlParser: true })

  console.log('Connected successfully to mongodb server')

  const db = mongoClient.db(config.dbName)

  DbManagement.addCommands(discordClient, db)

  discordClient.on('raw', async event => {
    if (event.t !== 'MESSAGE_REACTION_ADD' && event.t !== 'MESSAGE_REACTION_REMOVE') {
      return
    }

    const cursor = await db.collection('ReactionMessages').find()

    if (await cursor.count() !== 1) {
      throw new Error('ReactionMessages should contain only single document')
    }

    const reactionMessage = await cursor.next()

    const channel = discordClient.channels.get(event.d.channel_id)
    const message = await channel.fetchMessage(event.d.message_id)

    if (message.id !== reactionMessage.id) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: event.d.emoji.name })
    const role = message.guild.roles.find(r => r.name === emoteAndRole.role)
    const user = message.guild.members.get(event.d.user_id)

    if (event.t === 'MESSAGE_REACTION_ADD') {
      user.addRole(role)
    } else {
      user.removeRole(role)
    }
  })

  discordClient.addCommand('summon', async message => {
    await message.reply('Призыв услышан')
    await summon(db, message.member)
  }, 'Призывает бота в голосовой канал, в котором ты находишься.')

  discordClient.on('presenceUpdate', (oldMember, newMember) => {
    summon(db, newMember).catch(console.error)
  })
}

discordClient.on('message', message => {
  if (message.content.indexOf('!') !== 0) {
    return
  }

  const content = message.content.split(' ')
  const commandName = content.shift().substring(1)

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

  console.log(commandName, args)

  command.callback(message, args)
})

discordClient.on('error', err => console.error(`Discord client error: ${JSON.stringify(err, null, 2)}`))

discordClient.login(config.discordApiToken)

start().catch(console.error)
