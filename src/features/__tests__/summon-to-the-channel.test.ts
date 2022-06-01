import { summonToTheChannel } from '../summon-to-the-channel'
import { BaseGuildVoiceChannelMock } from './mocks/base-guild-voice-channel-mock'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'
import { ActivityModel } from '../../models/activity'

describe('summon-to-the-channel', () => {
  let dbInstance: MongoMemoryServer
  let mongooseInstance: Mongoose
  beforeAll(async () => {
    dbInstance = await MongoMemoryServer.create()
    mongooseInstance = await mongoose.connect(dbInstance.getUri())
  })

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongooseInstance.connection.db.dropDatabase()
  })

  afterAll(async () => {
    await mongooseInstance.disconnect()
    await dbInstance.stop()
  })

  it('should throw when there is no activity for given presence name', async () => {
    const sourceVoiceChannel = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life 3'
    await expect(summonToTheChannel(sourceVoiceChannel as any, presenceName, botUserId))
      .rejects.toThrowError('No activity found for presence name "Half-Life 3"')
  })

  it('should throw when there is no channel id for found activity', async () => {
    const sourceVoiceChannel = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life 3'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: '1',
      emoji: ':HL:',
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannel as any, presenceName, botUserId))
      .rejects.toThrowError('activity.channelId is undefined')
  })

  it('should throw when target voice channel is null', async () => {
    const sourceVoiceChannel = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life 3'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: '1',
      emoji: ':HL:',
      channelId: '0c0d9e8c-78a6-492e-890a-ecaeaf78acf0',
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannel as any, presenceName, botUserId))
      .rejects.toThrowError('targetVoiceChannel is null')
  })

  it('should return NOT_JOIN_SOURCE_CHANNEL when summoning to source voice channel', async () => {
    const sourceVoiceChannel = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life 3'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: '1',
      emoji: ':HL:',
      channelId: sourceVoiceChannel.id,
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannel as any, presenceName, botUserId))
      .rejects.toThrowError('activity.channelId is undefined')
  })
})
