import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'
import VoiceChannelStatsPlugin from '../voice-channel-stats-plugin'
import { VoiceChannelStatsModel } from '../../models/voice-channel-stats'
import { assertSingle } from '../../utils/assert'
import { VoiceStateMock } from './mocks/voice-state-mock'

const LAST_HOUR = new Date(2022, 5, 23, 0, 2, 3, 4)
const NOW = new Date(2022, 5, 23, 1, 2, 3, 4)
const MONDAY = new Date(2022, 5, 20)

describe('VoiceChannelStatsPlugin', () => {
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
        voiceChannelId: '1',
        timeMilliseconds: 1000,
        week: MONDAY,
      }
      await VoiceChannelStatsPlugin.updateStats(fields.voiceChannelId, fields.timeMilliseconds, NOW)
      const stats = assertSingle(await VoiceChannelStatsModel.find())
      expect(stats).toMatchObject(fields)
    })

    it('should update existing stat if it exists', async () => {
      const fields = {
        voiceChannelId: '1',
        timeMilliseconds: 1000,
        week: MONDAY,
      }
      await new VoiceChannelStatsModel({
        voiceChannelId: '1',
        timeMilliseconds: 2000,
        week: MONDAY,
      }).save()
      await VoiceChannelStatsPlugin.updateStats(fields.voiceChannelId, fields.timeMilliseconds, NOW)
      const stats = assertSingle(await VoiceChannelStatsModel.find())
      expect(stats).toMatchObject({ ...fields, timeMilliseconds: 3000 })
    })
  })

  describe('onVoiceStateUpdate', () => {
    it('should throw when newState.member is null', async () => {
      const plugin = new VoiceChannelStatsPlugin()
      const oldState = new VoiceStateMock()
      oldState.channelId = 'channel1'
      oldState.member = null
      const newState = new VoiceStateMock()
      newState.channelId = 'channel2'
      newState.member = null
      await expect(plugin.onVoiceStateUpdate(oldState as any, newState as any)).rejects
        .toThrowError('newState.member is null')
    })

    describe('user switches channel', () => {
      let updateStatsMock: jest.SpyInstance
      let oldState: VoiceStateMock
      let newState: VoiceStateMock
      let plugin: VoiceChannelStatsPlugin

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(VoiceChannelStatsPlugin, 'updateStats')
        plugin = new VoiceChannelStatsPlugin()
      })

      async function userSwitchesChannels() {
        oldState = new VoiceStateMock()
        oldState.channelId = 'channel1'
        newState = new VoiceStateMock()
        newState.channelId = 'channel2'
        await plugin.onVoiceStateUpdate(oldState as any, newState as any, NOW)
      }

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should update userJoinedChannelTimestamps', async () => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userJoinedChannelTimestamps'].set('user', LAST_HOUR)
        await userSwitchesChannels()
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const timestamps = Array.from(plugin['userJoinedChannelTimestamps']['map'])
        expect(timestamps).toStrictEqual([['user', NOW]])
      })

      it('should call updateStats 1 time', async () => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userJoinedChannelTimestamps'].set('user', LAST_HOUR)
        await userSwitchesChannels()
        expect(updateStatsMock).toBeCalledWith(oldState.channelId, NOW.getTime() - LAST_HOUR.getTime(), NOW)
      })

      it('should not call updateStats if joinedAt is null', async () => {
        await userSwitchesChannels()
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })

    describe('user leaves channel', () => {
      let updateStatsMock: jest.SpyInstance
      let oldState: VoiceStateMock
      let newState: VoiceStateMock
      let plugin: VoiceChannelStatsPlugin

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(VoiceChannelStatsPlugin, 'updateStats')
        plugin = new VoiceChannelStatsPlugin()
      })

      async function userLeavesChannel() {
        oldState = new VoiceStateMock()
        oldState.channelId = 'channel1'
        newState = new VoiceStateMock()
        newState.channelId = null
        await plugin.onVoiceStateUpdate(oldState as any, newState as any, NOW)
      }

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should update userJoinedChannelTimestamps', async () => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userJoinedChannelTimestamps'].set('user', LAST_HOUR)
        await userLeavesChannel()
        // eslint-disable-next-line @typescript-eslint/dot-notation
        expect(plugin['userJoinedChannelTimestamps']['map'].size).toBe(0)
      })

      it('should call updateStats 1 time', async () => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        plugin['userJoinedChannelTimestamps'].set('user', LAST_HOUR)
        await userLeavesChannel()
        expect(updateStatsMock).toBeCalledWith(oldState.channelId, NOW.getTime() - LAST_HOUR.getTime(), NOW)
      })

      it('should not call updateStats if joinedAt is null', async () => {
        await userLeavesChannel()
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })

    describe('user joins channel', () => {
      let updateStatsMock: jest.SpyInstance
      let oldState: VoiceStateMock
      let newState: VoiceStateMock
      let plugin: VoiceChannelStatsPlugin

      beforeEach(async () => {
        updateStatsMock = jest.spyOn(VoiceChannelStatsPlugin, 'updateStats')
        plugin = new VoiceChannelStatsPlugin()
      })

      async function userJoinsChannel() {
        oldState = new VoiceStateMock()
        oldState.channelId = null
        newState = new VoiceStateMock()
        newState.channelId = 'channel2'
        await plugin.onVoiceStateUpdate(oldState as any, newState as any, NOW)
      }

      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should update userJoinedChannelTimestamps', async () => {
        await userJoinsChannel()
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const timestamps = Array.from(plugin['userJoinedChannelTimestamps']['map'])
        expect(timestamps).toStrictEqual([['user', NOW]])
      })

      it('should not call updateStats', async () => {
        await userJoinsChannel()
        expect(updateStatsMock).toBeCalledTimes(0)
      })
    })
  })
})
