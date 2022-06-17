import { CommandOptionType, State, UserStateModel } from '../models/user-state'

// TODO: Tests
export default class UserStateManager {
  /**
   * Get a command argument provided after slash command.
   * @param userId Discord user id
   * @param index Index of the argument
   */
  async getCommandOption(userId: string, index: number) {
    const userState = await UserStateManager.getUserStateOrThrow(userId)

    if (index >= userState.commandOptions.length) {
      const parts = [
        `Command options array for user with id ${userId} consists of ${userState.commandOptions.length} elements, `,
        `but element with index ${index} is requested`,
      ]
      throw new Error(parts.join())
    }

    return userState.commandOptions[index]
  }

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
   * Set command options for the user.
   * @param userId Discord user id
   * @param commandOptions Arguments of slash command
   */
  async setCommandOptions(userId: string, commandOptions: CommandOptionType[]) {
    await UserStateModel.findOneAndUpdate({ userId }, { commandOptions }, { upsert: true })
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
