import Discord, { Guild, GuildMember, MessageReaction, Presence, Role, User } from 'discord.js'
import { commandStore } from '../commands/command-list'
import {
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  joinVoiceChannel, VoiceConnection,
} from '@discordjs/voice'
import fs from 'fs'
import prism from 'prism-media'
import logger from '../logger'
import { I18n } from '../i18n'
import { ActivityModel } from '../models/activity'
import { ReactionMessageModel } from '../models/reaction-message'
import googleSpeech from '@google-cloud/speech'
import config from '../config'
import { google } from '@google-cloud/speech/build/protos/protos'
import AudioEncoding = google.cloud.speech.v1.RecognitionConfig.AudioEncoding
import { Duplex } from 'stream'

const googleSpeechClient = new googleSpeech.SpeechClient()
const log = logger('listeners')

type ListenerFunction = (...args: any[]) => Promise<void>

function wrapErrorHandling(f: ListenerFunction): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args)
    } catch (error) {
      log.error('There was an error in the listener', error)
    }
  }
}

async function onReady(discordClient: Discord.Client): Promise<void> {
  log.info(`Logged in as ${discordClient.user?.tag ?? 'unknown user'}!`)
}

async function onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
  const member = newPresence.member
  const guild = newPresence.guild
  const voiceChannel = member?.voice.channel

  if (voiceChannel?.id === undefined) {
    return
  }

  if (guild === undefined || guild === null) {
    throw new Error(`Guild is ${String(guild)}`)
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel?.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  })

  // TODO: Cache mp3 in RAM, not read it from disk every time
  const resource = createAudioResource(fs.createReadStream(config.wrongChannelAudioPath))
  const player = createAudioPlayer()

  connection.subscribe(player)
  player.play(resource)

  connection.receiver.speaking.on('start', userId => onSpeakingStart(guild, connection, userId))
}

function onSpeakingStart(guild: Guild, connection: VoiceConnection, userId: string) {
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

  const request = {
    config: {
      encoding: AudioEncoding.LINEAR16,
      sampleRateHertz: 48000,
      languageCode: config.languageCode,
    },
    interimResults: false,
  }

  const userName = guild.members.resolve(userId)?.user.username ?? 'Unknown user'

  const recognizeStream: Duplex = googleSpeechClient.streamingRecognize(request)
    .on('data', data => onRecognitionData(data, userName, recognizeStream))
    .on('error', error => log.error('Google speech recognition error:', error))

  listenStream.pipe(opusDecoder).pipe(recognizeStream)
}

function onRecognitionData(data: any, userName: string, recognizeStream: Duplex) {
  log.info(`${userName}: ${data.results[0].alternatives[0].transcript}`)
  recognizeStream.emit('close')
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
  discordClient.on('ready', wrapErrorHandling(onReady))
  discordClient.on('presenceUpdate', wrapErrorHandling(onPresenceUpdate))
  discordClient.on('interactionCreate', wrapErrorHandling(onInteractionCreate))
  discordClient.on('messageReactionAdd', wrapErrorHandling(onMessageReactionAdd))
  discordClient.on('messageReactionRemove', wrapErrorHandling(onMessageReactionRemove))
}
