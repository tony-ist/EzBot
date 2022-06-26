import ListenerPlugin from './listener-plugin'
import { Activity, Presence } from 'discord.js'
import logger from '../logger'
import { getMonday } from '../utils/date'
import { GameStatsModel } from '../models/game-stats'
import { StringPairMap } from '../utils/string-pair-map'

const log = logger('plugins/game-stats')

export default class GameStatsPlugin implements ListenerPlugin {
  // First key is user id, second key is game name, value is timestamp when user started playing the game
  private readonly userStartedPlayingGameTimestamps

  constructor() {
    this.userStartedPlayingGameTimestamps = new StringPairMap<Date>()
  }

  static async updateStats(presenceName: string, timeMilliseconds: number, now: Date = new Date()) {
    const week = getMonday(now)
    const query = { presenceName, week }
    const update = { $inc: { timeMilliseconds } }
    await GameStatsModel.findOneAndUpdate(query, update, { upsert: true })
  }

  private static isUserSwitchedGame(oldActivities: Activity[], newActivities: Activity[]) {
    return oldActivities.length > 0 && newActivities.length > 0
  }

  private static isUserLeftGame(oldActivities: Activity[], newActivities: Activity[]) {
    return oldActivities.length > 0 && newActivities.length === 0
  }

  private static isUserJoinedGame(oldActivities: Activity[], newActivities: Activity[]) {
    return oldActivities.length === 0 && newActivities.length > 0
  }

  async userLeftGame(userId: string, userName: string, oldActivity: Activity, now: Date) {
    log.debug(`User "${userName}" left game "${oldActivity.name}" with game id "${oldActivity.id}"`)
    const startedPlaying = this.userStartedPlayingGameTimestamps.get(userId, oldActivity.name)
    this.userStartedPlayingGameTimestamps.delete(userId, oldActivity.name)

    if (startedPlaying === null) {
      log.info(`No info on when user "${userName}" started playing the game "${oldActivity.name}" found. Skipping...`)
      return
    }

    const timeMilliseconds = now.getTime() - startedPlaying.getTime()
    log.debug(`Time user "${userName}" spent in the game "${oldActivity.name}" in milliseconds: ${timeMilliseconds}`)
    await GameStatsPlugin.updateStats(oldActivity.name, timeMilliseconds, now)
  }

  async onPresenceUpdate(oldPresence: Presence | null, newPresence: Presence, now: Date = new Date()): Promise<void> {
    const oldActivities = oldPresence === null ? [] : oldPresence.activities
    const newActivities = newPresence.activities

    if (oldActivities.length > 1 || newActivities.length > 1) {
      log.debug(`FYI oldActivities or newActivities for user "${oldPresence?.user?.username}" has more than 1 element.`)
      log.debug('oldActivities:', oldActivities)
      log.debug('newActivities:', newActivities)
    }

    // Filter out activities with the same name from both arrays
    const relevantOldActivities = oldActivities
      .filter(activity => newActivities.find(a => a.name === activity.name) === undefined)
    const relevantNewActivities = newActivities
      .filter(activity => oldActivities.find(a => a.name === activity.name) === undefined)

    const userId = newPresence.userId

    if (newPresence.user === null) {
      throw new Error('newPresence.user is null')
    }

    const userName = newPresence.user.username

    for (const oldActivity of relevantOldActivities) {
      await this.userLeftGame(userId, userName, oldActivity, now)
    }

    for (const newActivity of relevantNewActivities) {
      log.debug(`User "${userName}" joined game "${newActivity.name}" with game id "${newActivity.id}"`)
      this.userStartedPlayingGameTimestamps.set(userId, newActivity.name, now)
    }
  }
}
