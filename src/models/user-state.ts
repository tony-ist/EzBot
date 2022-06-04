import { model, Schema } from 'mongoose'

export interface ConnectChannelState {
  /**
   * Names of activities that are selected in multiselect on step 2 of /connectchannel wizard
   */
  activityNames: string[]

  /**
   * Name of the channel that is provided in the first argument of /connectchannel command
   */
  channelName: string
}

export type State = ConnectChannelState

export type CommandOptionType = string | number | boolean | undefined

export interface UserState {
  /**
   * User id provided by discord. Example: 158576177009786880
   */
  userId: string

  /**
   * Values provided to the slash command. Example: ['544022547478478861', 'Tony', 1, undefined, false]
   */
  commandOptions: CommandOptionType[]

  /**
   * Values to use in wizard-like interactions on next steps.
   * Example: { activityNames: ['StarCraft', 'StarCraft II'], channelName: 'SC' }
   */
  state: State
}

const UserStateSchema = new Schema<UserState>({
  userId: { type: String, unique: true, required: true },
  commandOptions: { type: [String], required: true, default: [] },
  state: { type: Object, required: true },
})

export const UserStateModel = model<UserState>('UserState', UserStateSchema)
