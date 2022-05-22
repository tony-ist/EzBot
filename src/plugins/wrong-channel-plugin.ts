import ListenerPlugin from './listener-plugin'
import Discord, { Guild, Presence, VoiceBasedChannel } from 'discord.js'
import * as discordJsVoice from '@discordjs/voice'
import { Activity, ActivityModel } from '../models/activity'
import { playWrongChannelAudio } from '../audio/wrong-channel-audio'
import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import prism from 'prism-media'
import { recognizeSpeech } from '../utils/recognize-promised'
import { isNoPhrase, isYesPhrase } from '../utils/affirmation-analyser'
import config from '../config'
import logger from '../logger'

interface PresenceContext {
  voiceChannel: VoiceBasedChannel
  connection: VoiceConnection
  activity: Activity
}

const log = logger('wrong-channel-plugin')

const BOT_TIMEOUT_MS = config.botTimeoutMs === undefined ? 40000 : config.botTimeoutMs

export default class WrongChannelPlugin implements ListenerPlugin {
  discordClient: Discord.Client

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient
  }

  async onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
    const member = newPresence.member
    const guild = newPresence.guild
    const voiceChannel = member?.voice.channel

    const newActivity = newPresence.activities[0]

    // TODO#presenceChange: extract these ifs to some place
    // TODO#presenceChange: revise return or throw error
    // TODO#presenceChange: add debug logs where necessary
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
      // TODO#presenceChange: strange error throw
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
      this.leaveVoiceChannel(voiceChannel, connection)
    }, BOT_TIMEOUT_MS)

    log.debug('Started playing wrong channel audio...')
    await playWrongChannelAudio(connection)
    log.debug('Finished playing wrong channel audio')

    const presenceContext = {
      voiceChannel,
      connection,
      activity,
    }

    connection.receiver.speaking.on(
      'start',
      async (userId) => await this.onSpeakingStart(userId, guild, presenceContext),
    )
  }

  async onSpeakingStart(userId: string, guild: Guild, presenceContext: PresenceContext) {
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
    // TODO#presenceChange: can this be moved to outer scope?
    const opusDecoder = new prism.opus.Decoder({
      frameSize: 960,
      channels: 1,
      rate: 48000,
    })

    const recognitionData = await recognizeSpeech(listenStream.pipe(opusDecoder))

    const { activity, voiceChannel } = presenceContext
    const transcription = recognitionData.results[0].alternatives[0].transcript.toLocaleLowerCase()
    log.info(`${userName}: ${transcription}`)

    if (activity.channelId === undefined) {
      return
    }

    if (isYesPhrase(transcription)) {
      const targetVoiceChannel = await voiceChannel.guild.channels.fetch(activity.channelId)
      const promises = []

      for (const keyValue of voiceChannel.members) {
        const member = keyValue[1]
        if (member.user.id !== this.discordClient.user?.id) {
          log.info(`Moving member "${member.displayName}" to channel "${targetVoiceChannel?.name ?? targetVoiceChannel?.id}"`)
          promises.push(member.edit({ channel: targetVoiceChannel?.id }))
        }
      }

      await Promise.all(promises)
        .catch((error) => log.error('Error moving users:', error))

      // TODO#presenceChange: handle race condition where one user says long phrase while another user says 'yes'
      this.leaveVoiceChannel(voiceChannel, connection)

      return
    }

    if (isNoPhrase(transcription)) {
      this.leaveVoiceChannel(voiceChannel, connection)
    }
  }

  leaveVoiceChannel(voiceChannel: VoiceBasedChannel, connection: VoiceConnection) {
    log.info(`Leaving voice channel "${voiceChannel.name}"`)
    connection.disconnect()
    connection.destroy()
  }
}
