import { model, Schema } from 'mongoose'

export interface AddGamesState {
  /**
   * Name of the game that is provided as an argument to /addgames command and will be connected to the activity
   */
  gameName?: string

  /**
   * Name of the activity that is selected in select on step 2 of /addgames wizard
   */
  activityName?: string
}

export interface ConnectChannelState {
  /**
   * Id of the channel that is provided in the first argument of /connectchannel command
   */
  channelId?: string

  /**
   * Name of the channel that is provided in the first argument of /connectchannel command
   */
  channelName?: string

  /**
   * Names of activities that are selected in multiselect on step 2 of /connectchannel wizard
   */
  activityNames?: string[]
}

export type State = ConnectChannelState | AddGamesState

export interface UserState {
  /**
   * User id provided by discord. Example: 158576177009786880
   */
  userId: string

  /**
   * Values to use in wizard-like interactions on next steps.
   * Example: { activityNames: ['StarCraft', 'StarCraft II'], channelName: 'SC' }
   */
  state: State
}

const UserStateSchema = new Schema<UserState>({
  userId: { type: String, unique: true, required: true },
  state: { type: Object, required: true },
})

export const UserStateModel = model<UserState>('UserState', UserStateSchema)
