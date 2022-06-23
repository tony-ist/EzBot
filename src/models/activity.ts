import { model, Schema } from 'mongoose'

export interface Activity {
  /**
   * Activity Name. Can be any string.
   */
  name: string
  /**
   * Emoji symbol or custom emoji that is used for dashboard. Discord or unicode emoji can be specified.
   * Example value: <:SC2:123000>, ☭, 😄
   * @See https://discordjs.guide/popular-topics/reactions.html#custom-emojis
   */
  emoji: string
  /**
   * Discord role ID. When new Activity is created, role should be created too with activity name.
   */
  roleId: string
  /**
   * Discord channel id. It is used to bind the Activity to the channel.
   */
  channelId?: string
  /**
   * Discord presence names. Used to alert you that you are sitting in the wrong channel.
   */
  presenceNames: string[]
}

const ActivitySchema = new Schema<Activity>({
  name: { type: String, unique: true, required: true },
  emoji: { type: String, required: true },
  roleId: { type: String, required: true },
  channelId: { type: String },
  presenceNames: { type: [String], required: true, default: [] },
})

export const ActivityModel = model<Activity>('Activity', ActivitySchema)
