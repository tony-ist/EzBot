require('dotenv').config()
const DbManagement = require('./commands/DbManagement')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const googleSpeech = require('@google-cloud/speech')
const config = require('./config')
const ConvertTo1ChannelStream = require('./convertTo1ChannelStream')
const Dispatcher = require('./promised/Dispatcher')
const i18n = require('i18n')
const locale = require(`./locales/${config.locale}.json`)

i18n.configure({
  locales: ['en', 'ru'],
  directory: `${__dirname}/locales`
})
i18n.setLocale(config.locale)
const argsRegexp = /[^\s"]+|"([^"]*)"/gi
const discordClient = new Discord.Client()
const googleSpeechClient = new googleSpeech.SpeechClient()

let isBotInVoiceChannel = false

console.log(`Locale is: ${config.locale}`)

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.Commands = {}

discordClient.addCommand = (name, callback, description) => {
  discordClient.Commands[name] = { name, callback, description }
}

discordClient.addCommand('ping', message => {
  message.reply('Pong!')
}, i18n.__('PingHelp'))

discordClient.addCommand('game', message => {
  if (message.author.presence && message.author.presence.game) {
    message.reply(message.author.presence.game.name)
  } else {
    message.reply(i18n.__('NoGame'))
  }
}, i18n.__('GameHelp'))

discordClient.addCommand('help', message => {
  let reply = `${i18n.__('HelpDescription')}\n`

  for (const name in discordClient.Commands) {
    reply += `\`!${name}\`: ${discordClient.Commands[name].description || ''}\n`
  }

  reply += i18n.__('HelpAppendix')

  message.reply(reply)
}, i18n.__('HelpHelp'))

async function summon(db, member) {
  const presence = member.presence
  const userVoiceChannel = member.voiceChannel
  const isUserAfk = userVoiceChannel && userVoiceChannel.id === member.guild.afkChannelID

  if (!presence || !presence.game || !userVoiceChannel || isBotInVoiceChannel || isUserAfk) {
    return
  }

  const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: presence.game.name })

  if (!gameAndChannel) {
    return
  }

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
    const requestConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: config.languageCode
    }
    const request = {
      config: requestConfig
    }
    const recognizeStream = googleSpeechClient
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', response => {
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n')
          .toLowerCase()
        console.log(`Transcription: ${transcription}`)

        if (locale.YesWords.indexOf(transcription) > -1) {
          connection.channel.members.array().forEach(member => {
            if (member.user.id !== discordClient.user.id) {
              console.log(`Moving member ${member.displayName} to channel ${channelId}`)
              member.setVoiceChannel(channelId)
              isBotInVoiceChannel = false
              userVoiceChannel.leave()
            }
          })
        } else if (locale.NoWords.indexOf(transcription) > -1) {
          isBotInVoiceChannel = false
          userVoiceChannel.leave()
        } else if (locale.OnlyMeWords.indexOf(transcription) > -1) {
          member.guild.member(user).setVoiceChannel(channelId)
          isBotInVoiceChannel = false
          userVoiceChannel.leave()
        } else if (locale.MeTooWords.indexOf(transcription) > -1) {
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
    await message.reply(i18n.__('SummonHeard'))
    await summon(db, message.member)
  }, i18n.__('SummonHelp'))

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

// TODO: Stringify throws error circular JSON on some errors
discordClient.on('error', err => console.error(`Discord client error: ${JSON.stringify(err, null, 2)}`))

discordClient.login(config.discordApiToken)

start().catch(console.error)
