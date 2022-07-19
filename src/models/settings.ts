import { model, Schema } from 'mongoose'

export interface Settings {
  /**
   * This is id of the channel where bot will post weekly stats.
   */
  statsTextChannelId: string
}

const SettingsSchema = new Schema<Settings>({
  statsTextChannelId: { type: String, required: true },
})

export const SettingsModel = model<Settings>('Settings', SettingsSchema)
