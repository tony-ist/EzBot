import ListenerPlugin from './listener-plugin'
import { Activity, Presence } from 'discord.js'
import logger from '../logger'
import { NullMap } from '../utils/null-map'
import { getMonday } from '../utils/date'
import { GameStatsModel } from '../models/game-stats'

const log = logger('plugins/game-stats')

export default class GameStatsPlugin implements ListenerPlugin {
  // Key is user id, value is timestamp when user started playing the game
  private readonly userStartedPlayingGameTimestamps

  constructor(timestamps?: Array<[string, Date]>) {
    this.userStartedPlayingGameTimestamps = new NullMap<string, Date>(timestamps)
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

  async onPresenceUpdate(oldPresence: Presence | null, newPresence: Presence, now: Date = new Date()): Promise<void> {
    const oldActivities = oldPresence === null ? [] : oldPresence.activities
    const newActivities = newPresence.activities

    if (oldActivities.length > 1 || newActivities.length > 1) {
      log.debug(`FYI oldActivities or newActivities for user "${oldPresence?.user?.username}" has more than 1 element.`)
      log.debug('oldActivities:', oldActivities)
      log.debug('newActivities:', newActivities)

      // TODO: Handle multiple activities
      return
    }

    const oldGameName = oldActivities[0]?.name
    const newGameName = newActivities[0]?.name
    const userId = newPresence.userId
    const userName = newPresence.user?.username

    if (oldGameName === newGameName) {
      log.debug(`For user "${newPresence.user?.username}" old game is "${oldGameName}". It is the same as the new game. Skipping...`)
      return
    }

    if (GameStatsPlugin.isUserSwitchedGame(oldActivities, newActivities)) {
      log.debug(`User "${newPresence.user?.username}" switched game from game "${oldActivities[0].name}" with game id "${oldActivities[0].id}" to game "${newActivities[0].name}" with game id "${oldActivities[0].id}"`)
    } else if (GameStatsPlugin.isUserLeftGame(oldActivities, newActivities)) {
      log.debug(`User "${newPresence.user?.username}" left game "${oldActivities[0].name}" with game id "${oldActivities[0].id}"`)
    } else if (GameStatsPlugin.isUserJoinedGame(oldActivities, newActivities)) {
      log.debug(`User "${newPresence.user?.username}" joined game "${newActivities[0].name}" with game id "${newActivities[0].id}"`)
    }

    if (oldActivities.length > 0) {
      const startedPlaying = this.userStartedPlayingGameTimestamps.get(userId)

      if (newActivities.length === 0) {
        this.userStartedPlayingGameTimestamps.delete(userId)
      } else {
        this.userStartedPlayingGameTimestamps.set(userId, now)
      }

      if (startedPlaying === null) {
        log.info(`No info on when user "${userName}" started playing the game "${oldGameName}" found. Skipping...`)
        return
      }

      const timeMilliseconds = now.getTime() - startedPlaying.getTime()
      log.debug(`Time user "${userName}" spent in the game "${oldGameName}" in milliseconds: ${timeMilliseconds}`)
      await GameStatsPlugin.updateStats(oldGameName, timeMilliseconds, now)
    } else if (newActivities.length > 0) {
      this.userStartedPlayingGameTimestamps.set(userId, now)
    }
  }
}
