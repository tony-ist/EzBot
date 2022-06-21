import RolePlugin from '../role-plugin'
import { MessageReactionMock } from './mocks/message-reaction-mock'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'
import { ActivityModel } from '../../models/activity'
import { Collection } from 'discord.js'
import { RoleMock } from '../../tests-mocks/role-mock'

describe('role-plugin', () => {
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
  })

  describe('getRoleByReaction', () => {
    it('should throw when roleManager is undefined', async () => {
      const plugin = new RolePlugin()
      const messageReaction = new MessageReactionMock()
      messageReaction.message.guild.roles = undefined
      await expect(plugin.getRoleByReaction(messageReaction as any)).rejects
        .toThrowError('reaction.message.guild?.roles is undefined')
    })

    it('should throw when emoji id is null', async () => {
      const plugin = new RolePlugin()
      const messageReaction = new MessageReactionMock()
      messageReaction.emoji.id = null
      await expect(plugin.getRoleByReaction(messageReaction as any)).rejects
        .toThrowError('reaction.emoji.id is undefined, only custom emoji are supported')
    })

    it('should throw when there is no activity for emoji', async () => {
      const plugin = new RolePlugin()
      const messageReaction = new MessageReactionMock()
      await expect(plugin.getRoleByReaction(messageReaction as any)).rejects
        .toThrowError(`Activity for emoji with id "${messageReaction.emoji.id}" and name "${messageReaction.emoji.name}" was not found`)
    })

    it('should throw when there is no role for activity', async () => {
      const plugin = new RolePlugin()
      const messageReaction = new MessageReactionMock()
      const emoji = `<:${messageReaction.emoji.name}:${messageReaction.emoji.id}>`
      const activity = new ActivityModel({ name: 'Starcraft II', roleId: '1', emoji })
      await activity.save()
      await expect(plugin.getRoleByReaction(messageReaction as any)).rejects
        .toThrowError(`Role for activity with name "${activity.name}" was not found`)
    })

    it('should return role for activity', async () => {
      const plugin = new RolePlugin()
      const messageReaction = new MessageReactionMock()
      if (messageReaction.message.guild.roles === undefined) {
        throw new Error('messageReaction.message.guild.roles is undefined')
      }
      const roleCollection = new Collection([
        ['1', new RoleMock('1')],
        ['2', new RoleMock('2')],
      ])
      messageReaction.message.guild.roles.fetch = jest.fn(() => roleCollection)
      const emoji = `<:${messageReaction.emoji.name}:${messageReaction.emoji.id}>`
      const activity = new ActivityModel({ name: 'Starcraft II', roleId: '2', emoji })
      await activity.save()
      const actual = await plugin.getRoleByReaction(messageReaction as any)
      expect(actual).toBe(roleCollection.get('2'))
    })
  })
})
