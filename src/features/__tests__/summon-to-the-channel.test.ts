import { SummonOptions, SummonResult, summonToTheChannel } from '../summon-to-the-channel'
import { BaseGuildVoiceChannelMock } from './mocks/base-guild-voice-channel-mock'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose, HydratedDocument } from 'mongoose'
import { Activity, ActivityModel } from '../../models/activity'
import { NonThreadGuildBasedChannelMock } from './mocks/non-thread-guild-based-channel-mock'
import * as discordJsVoice from '@discordjs/voice'
import { VoiceConnectionMock } from './mocks/voice-connnection-mock'
// import * as speechModule from '../../components/iterate-recognized-speech'
import { UserMock } from './mocks/user-mock'
import { User } from 'discord.js'

jest.mock('@discordjs/voice')
const getVoiceConnectionMock = discordJsVoice.getVoiceConnection as jest.MockedFunction<typeof discordJsVoice.getVoiceConnection>
const joinVoiceChannelMock = discordJsVoice.joinVoiceChannel as jest.MockedFunction<typeof discordJsVoice.joinVoiceChannel>

jest.mock('../../audio/wrong-channel-audio')

// jest.mock('../../components/iterate-recognized-speech')
// const iterateRecognizedSpeechMock = speechModule.iterateRecognizedSpeech as jest.MockedFunction<typeof speechModule.iterateRecognizedSpeech>
jest.mock('../../components/iterate-recognized-speech', () => {
  const originalModule = jest.requireActual('../../components/iterate-recognized-speech')

  return {
    __esModule: true,
    ...originalModule,
    iterateRecognizedSpeech:
      async function * () {
        yield * [{ user: new UserMock() as User, transcription: 'yes' }]
      },
  }
})

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
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life 3'
    await expect(summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId))
      .rejects.toThrowError('No activity found for presence name "Half-Life 3"')
  })

  it('should throw when there is no channel id for found activity', async () => {
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: 'role-id',
      emoji: ':HL:',
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId))
      .rejects.toThrowError('activity.channelId is undefined')
  })

  it('should throw when target voice channel is null', async () => {
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    sourceVoiceChannelMock.guild.channels.fetch = jest.fn(async () => null)
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: 'role-id',
      emoji: ':HL:',
      channelId: 'target-voice-channel-id',
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId))
      .rejects.toThrowError('targetVoiceChannel is null')
  })

  it('should throw when target voice channel is not a voice channel', async () => {
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    const nonVoiceChannel = new NonThreadGuildBasedChannelMock()
    nonVoiceChannel.isVoice = jest.fn(() => false)
    sourceVoiceChannelMock.guild.channels.fetch = jest.fn(async () => nonVoiceChannel)
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: 'role-id',
      emoji: ':HL:',
      channelId: 'not-voice-channel-id',
      presenceNames: [presenceName],
    })
    await activity.save()
    await expect(summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId))
      .rejects.toThrowError('bot was summoned to the channel that is not a voice channel')
  })

  describe('summoning to source channel', () => {
    let sourceVoiceChannelMock: BaseGuildVoiceChannelMock
    let botUserId: string
    let presenceName: string
    let activity: HydratedDocument<Activity>
    let options: SummonOptions

    beforeEach(async () => {
      sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
      botUserId = 'botUserId'
      presenceName = 'Half-Life'
      activity = new ActivityModel({
        name: presenceName,
        roleId: 'role-id',
        emoji: ':HL:',
        channelId: sourceVoiceChannelMock.id,
        presenceNames: [presenceName],
      })
      options = {
        alreadyInRightChannelCallback: jest.fn(),
      }
      await activity.save()
    })

    it('should call callback one time', async () => {
      await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(options.alreadyInRightChannelCallback).toBeCalledTimes(1)
    })

    it('should return NOT_JOIN_SOURCE_CHANNEL', async () => {
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(actual).toBe(SummonResult.NOT_JOIN_SOURCE_CHANNEL)
    })
  })

  describe('summoning when bot is already in a channel', () => {
    let sourceVoiceChannelMock: BaseGuildVoiceChannelMock
    let botUserId: string
    let presenceName: string
    let activity: HydratedDocument<Activity>
    let options: SummonOptions

    beforeEach(async () => {
      getVoiceConnectionMock.mockImplementation(() => new VoiceConnectionMock() as any)
      sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
      botUserId = 'botUserId'
      presenceName = 'Half-Life'
      activity = new ActivityModel({
        name: presenceName,
        roleId: 'role-id',
        emoji: ':HL:',
        channelId: 'target-voice-channel-id',
        presenceNames: [presenceName],
      })
      options = {
        botInVoiceChannelCallback: jest.fn(),
      }
      await activity.save()
    })

    it('should call callback one time', async () => {
      await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(options.botInVoiceChannelCallback).toBeCalledTimes(1)
    })

    it('should return NOT_JOIN_ALREADY_IN_CHANNEL', async () => {
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(actual).toBe(SummonResult.NOT_JOIN_ALREADY_IN_CHANNEL)
    })
  })

  it('should move members on affirmative answer', async () => {
    getVoiceConnectionMock.mockImplementation(() => undefined)
    joinVoiceChannelMock.mockImplementation(() => new VoiceConnectionMock() as any)
    // console.log('speechModule:', speechModule)
    // iterateRecognizedSpeechMock.mockImplementation(async function * (connection, guild) {
    //   yield * [{ user: new UserMock() as User, transcription: 'yes' }]
    // })
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life'
    const activity = new ActivityModel({
      name: presenceName,
      roleId: 'role-id',
      emoji: ':HL:',
      channelId: 'target-voice-channel-id',
      presenceNames: [presenceName],
    })
    await activity.save()

    const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
    expect(actual).toBe(SummonResult.MOVE_MEMBERS)
  })
})
