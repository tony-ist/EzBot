import UserStateManager from '../user-state-manager'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Mongoose } from 'mongoose'
import { UserStateModel } from '../../models/user-state'

describe('user-state-manager', () => {
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

  describe('getState', () => {
    it('should throw when used before updateState', async () => {
      const manager = new UserStateManager()
      const userId = '1'
      await expect(manager.getState(userId)).rejects
        .toThrowError(`User state for user with id ${userId} does not exist`)
    })

    it('should return user state when used after updateState', async () => {
      const userId = '1'
      const state = { gameName: 'testgame', activityName: 'testactivity' }
      await new UserStateModel({ userId, state }).save()
      const manager = new UserStateManager()
      expect(await manager.getState(userId)).toStrictEqual(state)
    })
  })

  describe('updateState', () => {
    it('should create new state if it does not exist', async () => {
      const manager = new UserStateManager()
      const userId = '1'
      const state = { gameName: 'testgame' }

      await manager.updateState(userId, state)

      const userState = await UserStateModel.findOne({ userId })
      expect(userState).toMatchObject({ userId, state })
    })

    it('should update existing state without overwrite', async () => {
      const userId = '1'
      const oldState = { gameName: 'testgame' }
      const newState = { activityName: 'testactivity' }
      await new UserStateModel({ userId, state: oldState }).save()
      const manager = new UserStateManager()

      await manager.updateState(userId, newState)

      const userState = await UserStateModel.findOne({ userId })
      expect(userState).toMatchObject({ userId, state: { ...oldState, ...newState } })
    })

    it('should update existing state with overwrite when given same fields', async () => {
      const userId = '1'
      const oldState = { gameName: 'testgame', activityName: 'testactivity' }
      const newState = { gameName: 'testgame2' }
      await new UserStateModel({ userId, state: oldState }).save()
      const manager = new UserStateManager()

      await manager.updateState(userId, newState)

      const userState = await UserStateModel.findOne({ userId })
      expect(userState).toMatchObject({ userId, state: { ...oldState, ...newState } })
    })
  })
})
