import { BaseGuildVoiceChannel, Guild } from 'discord.js'
import * as discordJsVoice from '@discordjs/voice'
import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import { ActivityModel } from '../models/activity'
import { playWrongChannelAudio } from '../audio/wrong-channel-audio'
import { recognizeSpeech } from '../utils/recognize-speech'
import { isNoPhrase, isYesPhrase } from '../utils/affirmation-analyser'
import logger from '../logger'
import config from '../config'
import { moveMembers } from './move-members'

const log = logger('actions/summon-to-the-channel')

const BOT_TIMEOUT_MS = config.botTimeoutMs === undefined ? 40000 : config.botTimeoutMs

export interface SummonOptions {
  alreadyInRightChannelCallback?: () => Promise<void>
  botInVoiceChannelCallback?: () => Promise<void>
  canSummonBotCallback?: () => Promise<void>
}

/**
 * Bot joins `sourceVoiceChannel` and asks
 * everyone if they want to me moved to the correct `targetVoiceChannel` channel. `targetVoiceChannel` is found
 * using activity for provided `activityName`.
 * If the answer is neutral, then it stays in the channel and listens for other answers.
 * If it hears truthy answer, then it moves everyone
 * from that channel to the correct game channel.
 * If it hears falsy answer, then it just leaves with sadness on its metal face.
 * @param sourceVoiceChannel The voice channel where to summon the bot.
 * @param activityName The name of the game for the target voice channel.
 * The function will find the voice channel for that game
 * and move all users from the first channel to the second.
 * @param botUserId The client id of your bot.
 * @param options Provides callbacks. `alreadyInRightChannelCallback` is called in when `sourceVoiceChannel` is the same
 * as `targetVoiceChannel` that corresponds to `activityName`. `botInVoiceChannelCallback` is called if bot
 * is already in the voice channel and interacting with users. Function returns immediately after calling these callbacks.
 * `canSummonBotCallback` is called when function is going to summon the bot eventually and go on with the logic.
 */
// TODO: Consider renaming activityName to presenceName
export async function summonToTheChannel(
  sourceVoiceChannel: BaseGuildVoiceChannel,
  activityName: string,
  botUserId: string,
  options?: SummonOptions,
) {
  // TODO: Leave voice channel on any exception with global try catch
  const guild = sourceVoiceChannel.guild

  const activity = await ActivityModel.findOne({ presenceNames: activityName })
  if (activity === undefined || activity === null) {
    throw new Error(`activity is ${activity}`)
  }
  if (activity.channelId === undefined || activity.channelId === null) {
    throw new Error(`activity.channelId is ${activity.channelId}`)
  }

  const targetVoiceChannel = await guild.channels.fetch(activity.channelId)
  if (targetVoiceChannel === undefined || targetVoiceChannel === null) {
    throw new Error(`targetVoiceChannel is ${targetVoiceChannel}`)
  }
  if (!targetVoiceChannel.isVoice()) {
    throw new Error('bot was summoned to the channel that is not a voice channel')
  }

  if (activity.channelId === sourceVoiceChannel.id) {
    log.debug(`Trying to summon bot to the source voice channel with name "${sourceVoiceChannel.name}" and id ${sourceVoiceChannel.id}. Skipping...`)
    if (options?.alreadyInRightChannelCallback !== undefined) {
      await options.alreadyInRightChannelCallback()
    }
    return
  }

  if (isBotInVoiceChannel(guild)) {
    log.debug(`Bot is already in voice channel. Skipping...`)
    if (options?.botInVoiceChannelCallback !== undefined) {
      await options.botInVoiceChannelCallback()
    }
    return
  }

  log.info(`Joining voice channel "${sourceVoiceChannel.name}"`)
  if (options?.canSummonBotCallback !== undefined) {
    await options?.canSummonBotCallback()
  }

  const connection = discordJsVoice.joinVoiceChannel({
    channelId: sourceVoiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  })

  setTimeout(() => {
    leaveVoiceChannel(sourceVoiceChannel, connection)
  }, BOT_TIMEOUT_MS)

  log.debug('Started playing wrong channel audio...')
  await playWrongChannelAudio(connection)
  log.debug('Finished playing wrong channel audio')

  const handleSpeakingStart = async (userId: string) => {
    // TODO#presenceChange: Check if exception is handled
    const userName = guild.members.resolve(userId)?.user.username ?? 'Unknown user'
    log.debug(`User "${userName}" started speaking...`)

    if (connection.receiver.subscriptions.get(userId) !== undefined) {
      return // TODO: Comment
    }

    const listenStream = connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 1000,
      },
    })

    const transcription = await recognizeSpeech(listenStream)
    log.info(`User ${userName} transcription: ${transcription}`)

    if (isYesPhrase(transcription)) {
      const membersToMove = Array.from(sourceVoiceChannel.members.values())
        .filter((member) => member.user.id !== botUserId)

      await moveMembers(membersToMove, targetVoiceChannel)
      // TODO#presenceChange: handle race condition where one user says long phrase while another user says 'yes'
      leaveVoiceChannel(sourceVoiceChannel, connection)

      return
    }

    if (isNoPhrase(transcription)) {
      leaveVoiceChannel(sourceVoiceChannel, connection)

      return
    }

    log.debug(`"${transcription}" is neutral. Staying in the voice channel...`)
  }

  return await new Promise<void>((resolve, reject) => {
    connection.receiver.speaking.on(
      'start',
      (userId) => { handleSpeakingStart(userId).then(resolve).catch(reject) },
    )
  })
}

// TODO#presenceChange: Destroy every recognition stream on voice channel leave because of:
// ApiError: Audio Timeout Error: Long duration elapsed without audio. Audio should be sent close to real time.
function leaveVoiceChannel(voiceChannel: BaseGuildVoiceChannel, connection: VoiceConnection) {
  log.info(`Leaving voice channel "${voiceChannel.name}"`)
  connection.disconnect()
  connection.destroy()
}

function isBotInVoiceChannel(guild: Guild) {
  return discordJsVoice.getVoiceConnection(guild?.id) !== undefined
}
