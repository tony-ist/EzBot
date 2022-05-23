import { Guild, VoiceBasedChannel } from 'discord.js'
import * as discordJsVoice from '@discordjs/voice'
import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import { ActivityModel } from '../models/activity'
import { playWrongChannelAudio } from '../audio/wrong-channel-audio'
import prism from 'prism-media'
import { recognizeSpeech } from '../utils/recognize-promised'
import { isNoPhrase, isYesPhrase } from '../utils/affirmation-analyser'
import logger from '../logger'
import config from '../config'

interface PresenceContext {
  voiceChannel: VoiceBasedChannel
  connection: VoiceConnection
  botUserId: string
  targetChannelId: string
}

const log = logger('summon-to-the-wrong-channel')

const BOT_TIMEOUT_MS = config.botTimeoutMs === undefined ? 40000 : config.botTimeoutMs

// TODO#presenceChange: Rewrite description
/**
 * Checks if the user that has started the game is in wrong channel.
 * If so, then joins that channel and asks
 * everyone if they want to me moved to the correct channel.
 * If it hears truthy answer, then it moves everyone
 * from that channel to the correct game channel.
 * If it hears falsy answer, then it just leaves with sadness on its metal face.
 * @param voiceChannel The voice channel where to summon the bot.
 * @param activityName The name of the game that user has started.
 * The function will find the voice channel for that game
 * and move all users from the first channel to the second.
 * @param botUserId This is client id of the current bot.
 */
export async function summonToTheChannel(
  voiceChannel: VoiceBasedChannel,
  activityName: string,
  botUserId: string,
) {
  const guild = voiceChannel.guild

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

  const activity = await ActivityModel.findOne({ presenceNames: activityName })

  if (activity?.channelId === undefined) {
    return
  }

  const presenceContext: PresenceContext = {
    voiceChannel,
    connection,
    botUserId,
    targetChannelId: activity.channelId,
  }

  connection.receiver.speaking.on(
    'start',
    async (userId) => await onSpeakingStart(userId, guild, presenceContext),
  )
}

async function onSpeakingStart(userId: string, guild: Guild, presenceContext: PresenceContext) {
  const userName = guild.members.resolve(userId)?.user.username ?? 'Unknown user'

  log.debug(`User "${userName}" started speaking...`)

  const { connection, targetChannelId, voiceChannel, botUserId } = presenceContext

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

  const transcription = recognitionData.results[0].alternatives[0].transcript.toLocaleLowerCase()

  log.info(`${userName}: ${transcription}`)

  if (isYesPhrase(transcription)) {
    const targetVoiceChannel = await voiceChannel.guild.channels.fetch(targetChannelId)
    const promises = []

    for (const keyValue of voiceChannel.members) {
      const member = keyValue[1]
      if (member.user.id !== botUserId) {
        log.info(`Moving member "${member.displayName}" to channel "${targetVoiceChannel?.name ?? targetVoiceChannel?.id}"`)
        promises.push(member.edit({ channel: targetVoiceChannel?.id }))
      }
    }

    await Promise.all(promises)
      .catch((error) => log.error('Error moving users:', error))

    // TODO#presenceChange: handle race condition where one user says long phrase while another user says 'yes'
    leaveVoiceChannel(voiceChannel, connection)

    return
  }

  if (isNoPhrase(transcription)) {
    leaveVoiceChannel(voiceChannel, connection)
  }
}

// TODO#presenceChange: Destroy every recognition stream on voice channel leave because of:
// ApiError: Audio Timeout Error: Long duration elapsed without audio. Audio should be sent close to real time.
function leaveVoiceChannel(voiceChannel: VoiceBasedChannel, connection: VoiceConnection) {
  log.info(`Leaving voice channel "${voiceChannel.name}"`)
  connection.disconnect()
  connection.destroy()
}

export async function isRightChannel(voiceChannel: VoiceBasedChannel, activityName: string) {
  const activity = await ActivityModel.findOne({ presenceNames: activityName })

  if (activity === undefined || activity === null) {
    throw new Error(`activity is ${activity}`)
  }

  if (activity.channelId === undefined || activity.channelId === null) {
    throw new Error(`activity.channelId is ${activity.channelId}`)
  }

  return activity.channelId === voiceChannel.id
}

export function isBotInVoiceChannel(guild: Guild) {
  return discordJsVoice.getVoiceConnection(guild?.id) !== undefined
}
