import ListenerPlugin from './listener-plugin'
import { VoiceState } from 'discord.js'
import logger from '../logger'
import { NullMap } from '../utils/null-map'
import { VoiceChannelStatsModel } from '../models/voice-channel-stats'
import { getMonday } from '../utils/date'

const log = logger('plugins/stats')

export default class VoiceChannelStatsPlugin implements ListenerPlugin {
  // Key is user id, value is timestamp when user joined the channel
  private readonly userJoinedChannelTimestamps

  constructor(timestamps?: Array<[string, Date]>) {
    this.userJoinedChannelTimestamps = new NullMap<string, Date>(timestamps)
  }

  static async updateStats(voiceChannelId: string, timeMilliseconds: number, now: Date = new Date()) {
    const week = getMonday(now)
    const query = { voiceChannelId, week }
    const update = { $inc: { timeMilliseconds } }
    await VoiceChannelStatsModel.findOneAndUpdate(query, update, { upsert: true })
  }

  async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState, now: Date = new Date()) {
    // This means that user muted himself for example
    if (oldState.channelId === newState.channelId) {
      log.debug(`For user "${oldState.member?.user.username}" old voice channel is "${oldState.channelId}". It is the same as the new voice channel. Skipping...`)
      return
    }

    if (newState.member === null) {
      throw new Error('newState.member is null')
    }

    const userId = newState.member.user.id
    const userName = newState.member.user.username

    if (oldState.channelId !== null && newState.channelId !== null) {
      log.debug(`User "${userName}" moved from channel "${oldState.channel?.name}" to channel ${newState.channel?.name}`)
    } else if (oldState.channelId === null && newState.channelId !== null) {
      log.debug(`User "${userName}" joined the channel ${newState.channel?.name}`)
    } else if (oldState.channelId !== null && newState.channelId === null) {
      log.debug(`User "${userName}" left the channel ${oldState.channel?.name}`)
    }

    if (oldState.channelId !== null) {
      const joinedAt = this.userJoinedChannelTimestamps.get(userId)

      if (newState.channelId === null) {
        this.userJoinedChannelTimestamps.delete(userId)
      } else {
        this.userJoinedChannelTimestamps.set(userId, now)
      }

      if (joinedAt === null) {
        log.info(`No info on when user "${userName}" joined the voice channel "${oldState.channel?.name}" found. Skipping...`)
        return
      }

      const timeMilliseconds = now.getTime() - joinedAt.getTime()
      log.debug(`Time user spent in channel "${oldState.channel?.name}" in milliseconds: ${timeMilliseconds}`)
      await VoiceChannelStatsPlugin.updateStats(oldState.channelId, timeMilliseconds)
    } else if (newState.channelId !== null) {
      this.userJoinedChannelTimestamps.set(userId, now)
    }
  }
}
