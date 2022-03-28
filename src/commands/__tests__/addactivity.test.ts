import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'

import { addactivityCommand } from '../addactivity'
import { ActivityModel } from '../../models/activity'
import { CommandInteractionMock } from './mocks/command-interaction-mock'

const INVALID_EMOJI = '<WTF>::'
const VALID_EMOJI = '<:wtf:123>'

describe('addactivity command', () => {
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

  it('should reply with error when no name specified', async () => {
    const interaction = new CommandInteractionMock()
    await addactivityCommand.execute(interaction as any)
    expect(interaction.reply).toBeCalledWith('Activity name is required.')
  })

  it('should reply with error when empty name specified', async () => {
    const interaction = new CommandInteractionMock()
    await addactivityCommand.execute(interaction as any)
    interaction.options.set('activity', { value: '' })
    expect(interaction.reply).toBeCalledWith('Activity name is required.')
  })

  it('should reply with error when space name specified', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: ' ' })
    await addactivityCommand.execute(interaction as any)
    expect(interaction.reply).toBeCalledWith('Activity name is required.')
  })

  it('should reply with error when no emoji specified', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    await addactivityCommand.execute(interaction as any)
    expect(interaction.reply).toBeCalledWith('Emoji is required and should be valid emoji. For example `:SC2:`.')
  })

  it('should reply with error when emoji does not match emoji pattern', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    interaction.options.set('emoji', { value: INVALID_EMOJI })
    await addactivityCommand.execute(interaction as any)
    expect(interaction.reply).toBeCalledWith('Emoji is required and should be valid emoji. For example `:SC2:`.')
  })

  it('should throw an error when no guild in interaction', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    interaction.options.set('emoji', { value: VALID_EMOJI })
    interaction.guild = null
    await expect(addactivityCommand.execute(interaction as any))
      .rejects.toThrowError('No guild specified in interaction instance')
  })

  it('should create discord role by activity name', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    interaction.options.set('emoji', { value: VALID_EMOJI })
    await addactivityCommand.execute(interaction as any)
    expect(interaction.guild?.roles.create).toBeCalledWith({
      name: 'StarCraft 2',
      reason: 'Role for those who enjoy StarCraft 2. Created by EzBot.',
    })
  })

  it('should create activity with specified props', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    interaction.options.set('emoji', { value: VALID_EMOJI })
    await addactivityCommand.execute(interaction as any)
    const createdActivity = await ActivityModel.findOne()

    expect(createdActivity).toMatchObject({
      name: 'StarCraft 2',
      emoji: '123',
      roleId: 'role_id_mock_StarCraft 2',
    })
  })

  it('should reply when activity created', async () => {
    const interaction = new CommandInteractionMock()
    interaction.options.set('activity', { value: 'StarCraft 2' })
    interaction.options.set('emoji', { value: VALID_EMOJI })
    await addactivityCommand.execute(interaction as any)

    const replyMessage = interaction.reply.mock.calls[0][0]
    expect(replyMessage).toMatch('New activity with name `StarCraft 2` created')
  })
})
