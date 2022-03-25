import { Schema, model } from 'mongoose'

export interface Activity {
  /**
   * Activity Name. Can be any string.
   */
  name: string
  /**
   * Emoji name that used for dashboard. Example value: ':red_alert:'
   */
  emojiName: string
  /**
   * Discord role ID. When new Activity created role should be created to with activity name.
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
  name: { type: String, required: true },
  emojiName: { type: String, required: true },
  roleId: { type: String, required: true },
  channelId: { type: String },
  presenceNames: { type: [String], required: true, default: [] },
})

export const ActivityModel = model<Activity>('Activity', ActivitySchema)
