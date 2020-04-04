require('dotenv').config()
const packageJson = require('./package')
const DbManagement = require('./commands/DbManagement')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const googleSpeech = require('@google-cloud/speech')
const config = require('./config')
const ConvertTo1ChannelStream = require('./util/convertTo1ChannelStream')
const i18n = require('i18n')
const locale = require(`./locales/${config.locale}.json`)
const StringUtil = require('./util/stringUtil')

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
  if (message.author.presence && message.author.presence.activities.length > 0) {
    message.reply(message.author.presence.activities[0].name)
  } else {
    message.reply(i18n.__('NoGame'))
  }
}, i18n.__('GameHelp'))

discordClient.addCommand('welcomeAll', (message) => {
  if (!message.member.permissions.has('ADMINISTRATOR')) {
    return
  }

  for (let record of message.channel.members) {
    const member = record[1]
    console.log(`Sending welcome message to user ${member.nickname}.`)
    member
      .send(i18n.__('WelcomeMessage'))
      .catch(console.error)
  }

  message.reply(i18n.__('SendingWelcomeMessages'))
}, i18n.__('WelcomeAllHelp'))

discordClient.addCommand('help', message => {
  let reply = `${i18n.__('HelpDescription')}\n`

  for (const name in discordClient.Commands) {
    reply += `\`!${name}\`: ${discordClient.Commands[name].description || ''}\n`
  }

  reply += i18n.__('HelpAppendix')
  reply += `EzBot version ${packageJson.version}`

  message.reply(reply)
}, i18n.__('HelpHelp'))

async function summon(db, activityName, member) {
  const voiceChannel = member.voice.channel
  const gameAndChannel = await db.collection('GamesAndChannels').findOne({ game: activityName })

  if (!gameAndChannel) {
    return
  }

  const channelId = gameAndChannel.channel

  if (!channelId || channelId === voiceChannel.id) {
    return
  }

  const connection = await voiceChannel.join()
  isBotInVoiceChannel = true
  console.log(`Joined voice channel ${voiceChannel.name}`)

  connection.play(config.wrongChannelAudioPath)

  console.log('I am ready to listen...')

  setTimeout(() => {
    isBotInVoiceChannel = false
    voiceChannel.leave()
  }, config.botTimeout || 40000)

  const receiver = connection.receiver

  connection.on('speaking', (user, speaking) => {
    if (!speaking.has(1)) {
      return
    }

    console.log(`I'm listening to ${user.username}`)

    // this creates a 16-bit signed PCM, stereo 48KHz PCM stream.
    const audioStream = receiver.createStream(user, { mode: 'pcm' })
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
        console.log(`Transcription for user ${user.username}: ${transcription}`)

        if (StringUtil.isTranscriptionContains(transcription, locale.YesWords)) {
          connection.channel.members.array().forEach(member => {
            if (member.user.id !== discordClient.user.id) {
              console.log(`Moving member ${member.displayName} to channel ${channelId}`)
              member.edit({ channel: channelId }).catch(console.error)
              isBotInVoiceChannel = false
              voiceChannel.leave()
              recognizeStream.destroy()
            }
          })
        } else if (StringUtil.isTranscriptionContains(transcription, locale.NoWords)) {
          isBotInVoiceChannel = false
          voiceChannel.leave()
          recognizeStream.destroy()
        } else if (StringUtil.isTranscriptionContains(transcription, locale.OnlyMeWords)) {
          member.edit({ channel: channelId }).catch(console.error)
          isBotInVoiceChannel = false
          voiceChannel.leave()
          recognizeStream.destroy()
        } else if (StringUtil.isTranscriptionContains(transcription, locale.MeTooWords)) {
          member.edit({ channel: channelId }).catch(console.error)
        }
      })

    const convertTo1ChannelStream = new ConvertTo1ChannelStream()

    audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream)

    audioStream.on('error', console.error)

    audioStream.on('end', async () => {
      console.log('audioStream end')
    })
  })
}

async function start() {
  console.log(`EzBot version ${packageJson.version}`)

  const mongoClient = await MongoClient.connect(config.dbConnectionUrl, { useNewUrlParser: true, useUnifiedTopology: true })

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
    const messageId = event.d.message_id
    const guild = channel.guild

    if (messageId !== reactionMessage.id) {
      return
    }

    const emoteAndRole = await db.collection('EmotesAndRoles').findOne({ emote: event.d.emoji.name })
    const role = guild.roles.find(r => r.name === emoteAndRole.role)
    const user = guild.members.get(event.d.user_id)

    if (event.t === 'MESSAGE_REACTION_ADD') {
      user.roles.add(role)
    } else {
      user.roles.remove(role)
    }
  })

  discordClient.addCommand('summon', async (message, args) => {
    const member = message.member
    let activityName

    if (args[0]) {
      activityName = args[0]
    } else {
      activityName = member.presence && member.presence.activities.length > 0 && member.presence.activities[0].name
    }

    const presence = member.presence
    const voiceChannel = member.voice.channel
    const isUserAfk = voiceChannel && voiceChannel.id === member.guild.afkChannelID

    const gameAndChannel = await db.collection('GamesAndChannels').findOne({ channel: voiceChannel.id })
    const game = gameAndChannel && gameAndChannel.game

    if (!presence || !activityName || !voiceChannel || isBotInVoiceChannel || isUserAfk || game === activityName) {
      await message.reply(i18n.__('CannotSummon'))
      return
    }

    await message.reply(i18n.__('SummonHeard'))
    summon(db, activityName, member).catch(console.error)
  }, i18n.__('SummonHelp'))

  discordClient.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (oldPresence && oldPresence.activities.length > 0 && newPresence && newPresence.activities.length > 0) {
      if (oldPresence.activities[0].name === newPresence.activities[0].name) {
        return
      }
    }

    const presence = newPresence
    const member = newPresence.member
    const voiceChannel = member.voice.channel
    const isUserAfk = voiceChannel && voiceChannel.id === member.guild.afkChannelID
    const ignoredChannel = voiceChannel && await db.collection('IgnoreChannels').findOne({ id: voiceChannel.id })

    if (!presence ||
      presence.activities.length === 0 ||
      !voiceChannel ||
      isBotInVoiceChannel ||
      isUserAfk ||
      ignoredChannel
    ) {
      return
    }

    const activityName = newPresence.activities[0].name

    summon(db, activityName, member).catch(console.error)
  })
}

discordClient.on('guildMemberAdd', member => {
  console.log(`Sending welcome message to user ${member.nickname}`)
  member.send(i18n.__('WelcomeMessage'))
})

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
