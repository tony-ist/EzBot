import { State, UserStateModel } from '../models/user-state'

export default class UserStateManager {
  /**
   * Get state of the user or throw an error if there is no state for that user.
   * @param userId Discord user id
   */
  async getState(userId: string): Promise<State> {
    const userState = await UserStateManager.getUserStateOrThrow(userId)
    return userState.state
  }

  /**
   * Update only the fields provided in update object for the user state. If there is no state for that user, then create it.
   * @param userId Discord user id
   * @param update Fields to update
   */
  async updateState(userId: string, update: Partial<State>) {
    const currentUserState = await UserStateModel.findOne({ userId })

    if (currentUserState === null) {
      await new UserStateModel({ userId, state: update }).save()
    } else {
      currentUserState.state = { ...currentUserState.state, ...update }
      await currentUserState.save()
    }
  }

  /**
   * Clear state for the user, so that consecutive calls to `getState` will throw an error.
   * @param userId Discord user id
   */
  async clear(userId: string) {
    await UserStateModel.findOneAndDelete({ userId })
  }

  private static async getUserStateOrThrow(userId: string) {
    const userState = await UserStateModel.findOne({ userId })

    if (userState === null) {
      throw new Error(`User state for user with id ${userId} does not exist`)
    }

    return userState
  }
}
