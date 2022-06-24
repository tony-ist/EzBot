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

      // TODO: Handle multiple activities
      it('should do nothing on multiple activities', async () => {
        oldPresence.activities = [new ActivityMock(), new ActivityMock()]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
        // eslint-disable-next-line @typescript-eslint/dot-notation
        expect(plugin['userStartedPlayingGameTimestamps']['map'].size).toBe(0)
      })

      it('should update userStartedPlayingGameTimestamps', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        oldPresence.activities = [activity]
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userStartedPlayingGameTimestamps'].set(userId, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        // eslint-disable-next-line @typescript-eslint/dot-notation
        expect(plugin['userStartedPlayingGameTimestamps']['map'].size).toBe(0)
      })

      it('should call updateStats 1 time', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        oldPresence.activities = [activity]
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userStartedPlayingGameTimestamps'].set(userId, LAST_HOUR)
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

      // TODO: Handle multiple activities
      it('should do nothing on multiple activities', async () => {
        newPresence.activities = [new ActivityMock(), new ActivityMock()]
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
        // eslint-disable-next-line @typescript-eslint/dot-notation
        expect(plugin['userStartedPlayingGameTimestamps']['map'].size).toBe(0)
      })

      it('should update userStartedPlayingGameTimestamps', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        newPresence.activities = [activity]
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userStartedPlayingGameTimestamps'].set(userId, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const timestamps = Array.from(plugin['userStartedPlayingGameTimestamps']['map'])
        expect(timestamps).toStrictEqual([[userId, NOW]])
      })

      it('should not call updateStats', async () => {
        const activity = new ActivityMock()
        activity.name = 'activityName'
        newPresence.activities = [activity]
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userStartedPlayingGameTimestamps'].set(userId, LAST_HOUR)
        await plugin.onPresenceUpdate(oldPresence as any, newPresence as any, NOW)
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })
  })
})
