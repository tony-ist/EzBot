import { SummonOptions, SummonResult, summonToTheChannel } from '../summon-to-the-channel'
import { BaseGuildVoiceChannelMock } from './mocks/base-guild-voice-channel-mock'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { HydratedDocument, Mongoose } from 'mongoose'
import { Activity, ActivityModel } from '../../models/activity'
import { NonThreadGuildBasedChannelMock } from '../../__tests__/mocks/non-thread-guild-based-channel-mock'
import * as discordJsVoice from '@discordjs/voice'
import { VoiceConnectionMock } from './mocks/voice-connnection-mock'
import { UserMock } from '../../__tests__/mocks/user-mock'
import { User } from 'discord.js'
import { moveMembers } from '../move-members'
import { setTimeout as sleep } from 'node:timers/promises'
import * as timeUtil from '../../utils/time'

jest.mock('@discordjs/voice')
const getVoiceConnectionMock = discordJsVoice.getVoiceConnection as jest.MockedFunction<typeof discordJsVoice.getVoiceConnection>
const joinVoiceChannelMock = discordJsVoice.joinVoiceChannel as jest.MockedFunction<typeof discordJsVoice.joinVoiceChannel>

jest.mock('../../audio/wrong-channel-audio')

// Jest does not automatically mock async generator functions
// https://github.com/facebook/jest/issues/12040
let transcriptions: string[] = []
jest.mock('../../components/iterate-recognized-speech', () => {
  const originalModule = jest.requireActual('../../components/iterate-recognized-speech')

  return {
    __esModule: true,
    ...originalModule,
    iterateRecognizedSpeech:
      async function * () {
        for (let i = 0; i < transcriptions.length; i++) {
          const transcription = transcriptions[i]
          yield { user: new UserMock() as User, transcription }
          if (i < transcriptions.length - 1) {
            await sleep(1)
          }
        }
      },
  }
})

jest.mock('../move-members')
const moveMembersMock = moveMembers as jest.MockedFunction<typeof moveMembers>

jest.mock('../../utils/time')
const setTimeoutMock = timeUtil.setTimeout as jest.MockedFunction<typeof timeUtil.setTimeout>

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
    sourceVoiceChannelMock.guild.channels.fetch = jest.fn(async (channelId: string) => nonVoiceChannel)
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

  describe('trying to move to source channel', () => {
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

    it('should call callback alreadyInRightChannelCallback one time', async () => {
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

    it('should call callback botInVoiceChannelCallback one time', async () => {
      await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(options.botInVoiceChannelCallback).toBeCalledTimes(1)
    })

    it('should return NOT_JOIN_ALREADY_IN_CHANNEL', async () => {
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId, options)
      await expect(actual).toBe(SummonResult.NOT_JOIN_ALREADY_IN_CHANNEL)
    })
  })

  describe('successful summoning', () => {
    const sourceVoiceChannelMock = new BaseGuildVoiceChannelMock()
    const botUserId = 'botUserId'
    const presenceName = 'Half-Life'
    let activity: HydratedDocument<Activity>

    beforeEach(async () => {
      getVoiceConnectionMock.mockImplementation(() => undefined)
      joinVoiceChannelMock.mockImplementation(() => new VoiceConnectionMock() as any)
      transcriptions = []
      activity = new ActivityModel({
        name: presenceName,
        roleId: 'role-id',
        emoji: ':HL:',
        channelId: 'target-voice-channel-id',
        presenceNames: [presenceName],
      })
      await activity.save()
    })

    it('should call moveMembers on single affirmative answer', async () => {
      transcriptions = ['yes']
      const targetVoiceChannel = new NonThreadGuildBasedChannelMock()
      sourceVoiceChannelMock.guild.channels.fetch = jest.fn(async (channelId: string) => targetVoiceChannel)
      await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(moveMembersMock).toBeCalledWith([], targetVoiceChannel)
    })

    it('should return SummonResult.MOVE_MEMBERS on single affirmative answer', async () => {
      transcriptions = ['yes']
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(actual).toBe(SummonResult.MOVE_MEMBERS)
    })

    it('should not call moveMembers on single negative answer', async () => {
      transcriptions = ['no']
      await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(moveMembersMock).toBeCalledTimes(0)
    })

    it('should return SummonResult.LEAVE on single negative answer', async () => {
      transcriptions = ['no']
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(actual).toBe(SummonResult.LEAVE)
    })

    it('should return SummonResult.LEAVE_SPEECH_END on single neutral answer', async () => {
      transcriptions = ['neutral']
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(actual).toBe(SummonResult.LEAVE_SPEECH_END)
    })

    it('should return SummonResult.LEAVE_BY_TIMEOUT on timeout', async () => {
      transcriptions = ['neutral1', 'neutral2', 'neutral3']
      setTimeoutMock.mockImplementation((callback: () => void, ms?: number) => setTimeout(callback, 0))
      const actual = await summonToTheChannel(sourceVoiceChannelMock as any, presenceName, botUserId)
      expect(actual).toBe(SummonResult.LEAVE_BY_TIMEOUT)
    })
  })
})
