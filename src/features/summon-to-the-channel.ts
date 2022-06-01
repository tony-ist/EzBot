import { BaseGuildVoiceChannel, Guild } from 'discord.js'
import * as discordJsVoice from '@discordjs/voice'
import { VoiceConnection } from '@discordjs/voice'
import { ActivityModel } from '../models/activity'
import { playWrongChannelAudio } from '../audio/wrong-channel-audio'
import { AffirmationAnalysisResult, analyzeAffirmation } from '../utils/affirmation-analyser'
import logger from '../logger'
import config from '../config'
import { moveMembers } from './move-members'
import { iterateRecognizedSpeech } from '../components/iterate-recognized-speech'

const log = logger('features/summon-to-the-channel')

const BOT_TIMEOUT_MS = config.botTimeoutMs === undefined ? 40000 : config.botTimeoutMs

export interface SummonOptions {
  alreadyInRightChannelCallback?: () => Promise<void>
  botInVoiceChannelCallback?: () => Promise<void>
  canSummonBotCallback?: () => Promise<void>
}

export enum SummonResult {
  MOVE_MEMBERS,
  LEAVE,
  LEAVE_BY_TIMEOUT,
  LEAVE_SPEECH_END,
  NOT_JOIN_SOURCE_CHANNEL,
  NOT_JOIN_ALREADY_IN_CHANNEL,
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
): Promise<SummonResult> {
  // TODO: Leave voice channel on any exception with global try catch
  const guild = sourceVoiceChannel.guild

  // TODO: Cast activityName and presenceNames to lower register
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
    return SummonResult.NOT_JOIN_SOURCE_CHANNEL
  }

  if (isBotInVoiceChannel(guild)) {
    log.debug(`Bot is already in voice channel. Skipping...`)
    if (options?.botInVoiceChannelCallback !== undefined) {
      await options.botInVoiceChannelCallback()
    }
    return SummonResult.NOT_JOIN_ALREADY_IN_CHANNEL
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

  log.debug('Started playing wrong channel audio...')
  await playWrongChannelAudio(connection)
  log.debug('Finished playing wrong channel audio')

  setTimeout(() => {
    // TODO#presenceChange: Return code LEAVE_BY_TIMEOUT
    try {
      if (isBotInVoiceChannel(guild)) {
        leaveVoiceChannel(sourceVoiceChannel, connection)
      }
    } catch (error) {
      log.error('Error in setTimeout leaveVoiceChannel:', error)
    }
  }, BOT_TIMEOUT_MS)

  for await (const userTranscription of iterateRecognizedSpeech(connection, guild)) {
    const { user, transcription } = userTranscription
    log.info(`User "${user.username}" transcription: "${transcription}"`)

    const affirmationAnalysisResult = analyzeAffirmation(transcription)

    if (affirmationAnalysisResult === AffirmationAnalysisResult.AFFIRMATION) {
      const membersToMove = Array.from(sourceVoiceChannel.members.values())
        .filter((member) => member.user.id !== botUserId)

      await moveMembers(membersToMove, targetVoiceChannel)
      // TODO#presenceChange: handle race condition where one user says long phrase while another user says 'yes'
      leaveVoiceChannel(sourceVoiceChannel, connection)

      return SummonResult.MOVE_MEMBERS
    } else if (affirmationAnalysisResult === AffirmationAnalysisResult.DENIAL) {
      leaveVoiceChannel(sourceVoiceChannel, connection)

      return SummonResult.LEAVE
    } else if (affirmationAnalysisResult === AffirmationAnalysisResult.NEUTRAL) {
      log.debug(`"${transcription}" is neutral. Staying in the voice channel...`)
    } else {
      throw new Error(`Unknown affirmation analysis result "${affirmationAnalysisResult}"`)
    }
  }

  leaveVoiceChannel(sourceVoiceChannel, connection)

  return SummonResult.LEAVE_SPEECH_END
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
