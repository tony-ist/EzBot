import { model, Schema } from 'mongoose'

export interface VoiceChannelStats {
  voiceChannelId: string

  /**
   * Monday of the week that this stat is for.
   */
  week: Date

  /**
   * Amount of time in milliseconds users spent in the channel during the week multiplied by the number of users in the channel.
   */
  timeMilliseconds: number

  /**
   * Maximum amount of users that were in the voice channel during the week.
   */
  maxUsers: number
}

const VoiceChannelStatsSchema = new Schema<VoiceChannelStats>({
  voiceChannelId: { type: String, required: true },
  week: { type: Date, required: true },
  timeMilliseconds: { type: Number, required: true },
  maxUsers: { type: Number, required: true, default: 0 },
})

export const VoiceChannelStatsModel = model<VoiceChannelStats>('VoiceChannelStats', VoiceChannelStatsSchema)
