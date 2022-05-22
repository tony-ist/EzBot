import Discord, { Guild, GuildMember, MessageReaction, Presence, Role, User, VoiceBasedChannel } from 'discord.js'
import { commandStore } from '../commands/command-list'
import * as discordJsVoice from '@discordjs/voice'
import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import prism from 'prism-media'
import logger from '../logger'
import { I18n } from '../i18n'
import { Activity, ActivityModel } from '../models/activity'
import { ReactionMessageModel } from '../models/reaction-message'
import config from '../config'
import { isNoPhrase, isYesPhrase } from '../utils/affirmation-analyser'
import { playWrongChannelAudio } from '../audio/wrong-channel-audio'
import { RecognitionData, recognizeSpeech } from '../utils/recognize-promised'

const log = logger('listeners')
const BOT_TIMEOUT_MS = config.botTimeoutMs === undefined ? 40000 : config.botTimeoutMs

type ListenerFunction = (...args: any[]) => Promise<void>

interface PresenceContext {
  discordClient: Discord.Client
  voiceChannel: VoiceBasedChannel
  connection: VoiceConnection
  activity: Activity
}

function wrapErrorHandling(f: ListenerFunction, ...otherArgs: any[]): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args, ...otherArgs)
    } catch (error) {
      log.error('There was an error in the listener:', error)
    }
  }
}

async function onReady(discordClient: Discord.Client): Promise<void> {
  log.info(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
}

async function onPresenceUpdate(oldPresence: Presence, newPresence: Presence, discordClient: Discord.Client): Promise<void> {
  const member = newPresence.member
  const guild = newPresence.guild
  const voiceChannel = member?.voice.channel

  const newActivity = newPresence.activities[0]

  if (newActivity === undefined) {
    return
  }

  const newActivityName = newPresence.activities[0]?.name

  if (newActivityName === undefined) {
    return
  }

  if (voiceChannel?.id === undefined) {
    return
  }

  if (newPresence.guild?.id === undefined) {
    return
  }

  const isBotInVoiceChannel = discordJsVoice.getVoiceConnection(newPresence.guild?.id) !== undefined

  if (isBotInVoiceChannel) {
    return
  }

  if (guild === undefined || guild === null) {
    throw new Error(`Guild is ${String(guild)}`)
  }

  const activity = await ActivityModel.findOne({ presenceNames: newActivityName })

  if (activity?.channelId === undefined) {
    return
  }

  if (activity.channelId === voiceChannel.id) {
    return
  }

  log.info(`Joining voice channel "${voiceChannel.name}"`)

  const connection = discordJsVoice.joinVoiceChannel({
    channelId: voiceChannel?.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  })

  setTimeout(() => {
    leaveVoiceChannel(voiceChannel, connection)
  }, BOT_TIMEOUT_MS)

  log.debug('Started playing wrong channel audio...')
  await playWrongChannelAudio(connection)
  log.debug('Finished playing wrong channel audio')

  const presenceContext = {
    discordClient,
    voiceChannel,
    connection,
    activity,
  }

  connection.receiver.speaking.on(
    'start',
    async (userId) => await onSpeakingStart(userId, guild, presenceContext),
  )
}

async function onSpeakingStart(userId: string, guild: Guild, presenceContext: PresenceContext) {
  const userName = guild.members.resolve(userId)?.user.username ?? 'Unknown user'

  log.debug(`User "${userName}" started speaking...`)

  const { connection } = presenceContext

  if (connection.receiver.subscriptions.get(userId) !== undefined) {
    return
  }

  const listenStream = connection.receiver.subscribe(userId, {
    end: {
      behavior: EndBehaviorType.AfterSilence,
      duration: 1000,
    },
  })

  // this creates a 16-bit signed PCM, mono 48KHz PCM stream output
  const opusDecoder = new prism.opus.Decoder({
    frameSize: 960,
    channels: 1,
    rate: 48000,
  })

  const recognitionData = await recognizeSpeech(listenStream.pipe(opusDecoder))

  await onRecognitionData(recognitionData, userName, presenceContext)
}

async function onRecognitionData(data: RecognitionData, userName: string, presenceContext: PresenceContext) {
  const { discordClient, activity, voiceChannel, connection } = presenceContext
  const transcription = data.results[0].alternatives[0].transcript.toLocaleLowerCase()
  log.info(`${userName}: ${transcription}`)

  if (activity.channelId === undefined) {
    return
  }

  if (isYesPhrase(transcription)) {
    const targetVoiceChannel = await voiceChannel.guild.channels.fetch(activity.channelId)

    voiceChannel.members.forEach(member => {
      if (member.user.id !== discordClient.user?.id) {
        log.info(`Moving member "${member.displayName}" to channel "${targetVoiceChannel?.name ?? targetVoiceChannel?.id}"`)
        // TODO: Print stack trace of that error
        member.edit({ channel: targetVoiceChannel?.id }).catch(log.error)
      }
    })

    leaveVoiceChannel(voiceChannel, connection)

    return
  }

  if (isNoPhrase(transcription)) {
    leaveVoiceChannel(voiceChannel, connection)
  }
}

function leaveVoiceChannel(voiceChannel: VoiceBasedChannel, connection: VoiceConnection) {
  log.info(`Leaving voice channel "${voiceChannel.name}"`)
  connection.disconnect()
  connection.destroy()
}

async function onInteractionCreate(interaction: Discord.Interaction): Promise<void> {
  if (!interaction.isCommand()) return

  // interaction.commandName is a string. There is no guarantee that it is of AllCommandNames type.
  const command = commandStore.get(interaction.commandName as any)
  if (command === undefined || command === null) {
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    await interaction.reply({ content: I18n.errorOnCommand(), ephemeral: true })
    throw error
  }
}

async function getRoleByReaction(reaction: MessageReaction): Promise<Role> {
  const roleManager = reaction.message.guild?.roles

  if (roleManager === undefined) {
    throw new Error('reaction.message.guild?.roles is undefined')
  }

  if (reaction.emoji.id === null) {
    throw new Error('reaction.emoji.id is undefined, only custom emoji are supported')
  }

  const activity = await ActivityModel.findOne({ emoji: reaction.emoji.id })

  if (activity === null) {
    throw new Error(`Activity for emoji with id "${reaction.emoji.id}" and name "${reaction.emoji.name}" was not found`)
  }

  const roles = await roleManager.fetch()

  const role = roles.find((r) => r.id === activity.roleId)

  if (role === undefined) {
    throw new Error(`Role for activity with name "${activity.name}" was not found`)
  }

  return role
}

async function getMemberByUser(reaction: MessageReaction, user: User): Promise<GuildMember> {
  const guildMemberManager = reaction.message.guild?.members

  if (guildMemberManager === undefined) {
    throw new Error('reaction.message.guild?.members is undefined')
  }

  return await guildMemberManager.fetch(user)
}

async function isReactionOnReactionMessage(reaction: MessageReaction): Promise<boolean> {
  const reactionMessage = await ReactionMessageModel.findOne({ id: reaction.message.id })
  return reactionMessage !== null
}

export async function onMessageReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
  if (!await isReactionOnReactionMessage(reaction)) {
    return
  }

  const role = await getRoleByReaction(reaction)
  const member = await getMemberByUser(reaction, user)
  await member.roles.add(role)

  log.debug(`Added role "${role.name}" to user "${user.username}"`)
}

export async function onMessageReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
  if (!await isReactionOnReactionMessage(reaction)) {
    return
  }

  const role = await getRoleByReaction(reaction)
  const member = await getMemberByUser(reaction, user)
  await member.roles.remove(role)

  log.debug(`Removed role "${role.name}" from user "${user.username}"`)
}

export function registerDiscordListeners(discordClient: Discord.Client): void {
  // TODO: Move registration to top level
  // TODO: Extract to class XListenerPlugin with parent ListenerPlugin, implement methods ready, presenceUpdate, etc
  discordClient.on('ready', wrapErrorHandling(onReady))
  discordClient.on('presenceUpdate', wrapErrorHandling(onPresenceUpdate, discordClient))
  discordClient.on('interactionCreate', wrapErrorHandling(onInteractionCreate))
  discordClient.on('messageReactionAdd', wrapErrorHandling(onMessageReactionAdd))
  discordClient.on('messageReactionRemove', wrapErrorHandling(onMessageReactionRemove))
}
