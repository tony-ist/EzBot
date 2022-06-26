import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'
import GameStatsPlugin from '../game-stats-plugin'
import { GameStatsModel } from '../../models/game-stats'
import { assertSingle } from '../../utils/assert'
import { PresenceMock } from '../../__tests__/mocks/presence-mock'
import { ActivityMock } from '../../__tests__/mocks/activity-mock'

const LAST_HOUR = new Date(2022, 5, 23, 0, 2, 3, 4)
const NOW = new Date(2022, 5, 23, 1, 2, 3, 4)
const MONDAY = new Date(2022, 5, 20)

/* eslint-disable @typescript-eslint/dot-notation */
describe('GameStatsPlugin', () => {
  let dbInstance: MongoMemoryServer
  let mongooseInstance: Mongoose
  beforeAll(async () => {
    dbInstance = await MongoMemoryServer.create()
    mongooseInstance = await mongoose.connect(dbInstance.getUri())
  })

  afterAll(async () => {
    await mongooseInstance.disconnect()
    await dbInstance.stop()
  })

  beforeEach(async () => {
    await mongooseInstance.connection.db.dropDatabase()
    jest.clearAllMocks()
  })

  describe('updateStats', () => {
    it('should insert new stat if it does not exist', async () => {
      const fields = {
        presenceName: 'League of Legends',
        timeMilliseconds: 1000,
        week: MONDAY,
      }
      await GameStatsPlugin.updateStats(fields.presenceName, fields.timeMilliseconds, NOW)
      const stats = assertSingle(await GameStatsModel.find())
      expect(stats).toMatchObject(fields)
    })

    it('should update existing stat if it exists', async () => {
      const fields = {
        presenceName: 'League of Legends',
        timeMilliseconds: 1000,
        week: MONDAY,
      }
      await new GameStatsModel({
        presenceName: 'League of Legends',
        timeMilliseconds: 2000,
        week: MONDAY,
      }).save()
      await GameStatsPlugin.updateStats(fields.presenceName, fields.timeMilliseconds, NOW)
      const stats = assertSingle(await GameStatsModel.find())
      expect(stats).toMatchObject({ ...fields, timeMilliseconds: 3000 })
    })
  })

  describe('onPresenceUpdate', () => {
    describe('user leaves game', () => {
      let updateStatsMock: jest.SpyInstance
      let oldPresence: PresenceMock
      let newPresence: PresenceMock
      let plugin: GameStatsPlugin
      const userId = 'userId'

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(GameStatsPlugin, 'updateStats')
        oldPresence = new PresenceMock()
        oldPresence.userId = userId
        newPresence = new PresenceMock()
        newPresence.userId = userId
        plugin = new GameStatsPlugin()
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should clear userStartedPlayingGameTimestamps on multiple activities in diff', async () => {
        const activity1 = new ActivityMock()
        activity1.name = 'activityName1'
        const activity2 = new ActivityMock()
        activity2.name = 'activityName2'
        oldPresence.activities = [activity1, activity2]
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity1.name, LAST_HOUR)
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity2.name, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(plugin['userStartedPlayingGameTimestamps'].entriesArray()).toStrictEqual([])
      })

      it('should clear userStartedPlayingGameTimestamps on single activity in diff', async () => {
        const activity1 = new ActivityMock()
        activity1.name = 'activityName1'
        const activity2 = new ActivityMock()
        activity2.name = 'activityName2'
        oldPresence.activities = [activity1, activity2]
        newPresence.activities = [activity1]
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity1.name, LAST_HOUR)
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity2.name, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(plugin['userStartedPlayingGameTimestamps'].entriesArray())
          .toStrictEqual([[userId, activity1.name, LAST_HOUR]])
      })

      it('should call updateStats 1 time if there is one old activity', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        oldPresence.activities = [activity]
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity.name, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledWith(activity.name, NOW.getTime() - LAST_HOUR.getTime(), NOW)
      })

      it('should not call updateStats if startedPlaying is null', async () => {
        oldPresence.activities = [new ActivityMock()]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })

    describe('user joins game', () => {
      let updateStatsMock: jest.SpyInstance
      let oldPresence: PresenceMock
      let newPresence: PresenceMock
      let plugin: GameStatsPlugin
      const userId = 'userId'

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(GameStatsPlugin, 'updateStats')
        oldPresence = new PresenceMock()
        oldPresence.userId = userId
        newPresence = new PresenceMock()
        newPresence.userId = userId
        plugin = new GameStatsPlugin()
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should update userStartedPlayingGameTimestamps on multiple activities in diff', async () => {
        const activity1 = new ActivityMock()
        activity1.name = 'activityName1'
        const activity2 = new ActivityMock()
        activity2.name = 'activityName2'
        newPresence.activities = [activity1, activity2]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
        expect(plugin['userStartedPlayingGameTimestamps'].entriesArray())
          .toStrictEqual([[userId, activity1.name, NOW], [userId, activity2.name, NOW]])
      })

      it('should update userStartedPlayingGameTimestamps on single activity in diff', async () => {
        const activity1 = new ActivityMock()
        activity1.name = 'activityName1'
        const activity2 = new ActivityMock()
        activity2.name = 'activityName2'
        oldPresence.activities = [activity1]
        newPresence.activities = [activity1, activity2]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(plugin['userStartedPlayingGameTimestamps'].entriesArray())
          .toStrictEqual([[userId, activity2.name, NOW]])
      })

      it('should not call updateStats', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        newPresence.activities = [activity]
        plugin['userStartedPlayingGameTimestamps'].set(userId, activity.name, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })

    describe('user switches game', () => {
      let updateStatsMock: jest.SpyInstance
      let oldPresence: PresenceMock
      let newPresence: PresenceMock
      let plugin: GameStatsPlugin
      const userId = 'userId'

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(GameStatsPlugin, 'updateStats')
        oldPresence = new PresenceMock()
        oldPresence.userId = userId
        newPresence = new PresenceMock()
        newPresence.userId = userId
        plugin = new GameStatsPlugin()
      })

      afterEach(() => {
        jest.clearAllMocks()
      })

      describe('single activity in diff', () => {
        describe('activities have 2 elements', () => {
          const activity1 = new ActivityMock()
          const activity2 = new ActivityMock()
          const activity3 = new ActivityMock()

          beforeEach(() => {
            activity1.name = 'activityName1'
            activity2.name = 'activityName2'
            activity3.name = 'activityName3'
            oldPresence.activities = [activity1, activity2]
            newPresence.activities = [activity1, activity3]
            plugin['userStartedPlayingGameTimestamps'].set(userId, activity1.name, LAST_HOUR)
            plugin['userStartedPlayingGameTimestamps'].set(userId, activity2.name, LAST_HOUR)
          })

          it('should update userStartedPlayingGameTimestamps', async () => {
            await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
            expect(plugin['userStartedPlayingGameTimestamps'].entriesArray())
              .toStrictEqual([[userId, activity1.name, LAST_HOUR], [userId, activity3.name, NOW]])
          })

          it('should call updateStats 1 time', async () => {
            await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
            expect(updateStatsMock).toBeCalledWith(activity2.name, NOW.getTime() - LAST_HOUR.getTime(), NOW)
          })
        })

        describe('activities have 1 element', () => {
          const activity1 = new ActivityMock()
          const activity2 = new ActivityMock()

          beforeEach(() => {
            activity1.name = 'activityName1'
            activity2.name = 'activityName2'
            oldPresence.activities = [activity1]
            newPresence.activities = [activity2]
            plugin['userStartedPlayingGameTimestamps'].set(userId, activity1.name, LAST_HOUR)
          })

          it('should update userStartedPlayingGameTimestamps on single activity in diff when activities have 1 element', async () => {
            await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
            expect(plugin['userStartedPlayingGameTimestamps'].entriesArray())
              .toStrictEqual([[userId, activity2.name, NOW]])
          })

          it('should call updateStats 1 time on single activity in diff when activities have 1 element', async () => {
            await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
            expect(updateStatsMock).toBeCalledWith(activity1.name, NOW.getTime() - LAST_HOUR.getTime(), NOW)
          })
        })
      })

      it('should not call updateStats if startedPlaying is null', async () => {
        const activity1 = new ActivityMock()
        activity1.name = 'activityName1'
        const activity2 = new ActivityMock()
        activity2.name = 'activityName2'
        oldPresence.activities = [activity1]
        newPresence.activities = [activity2]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })
  })
})
