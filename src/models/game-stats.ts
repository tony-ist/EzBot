import { model, Schema } from 'mongoose'

export interface GameStats {
  /**
   * Name of the game that this stat is for.
   */
  presenceName: string

  /**
   * Monday of the week that this stat is for.
   */
  week: Date

  /**
   * Amount of time in milliseconds users spent playing the game.
   */
  timeMilliseconds: number
}

const GameStatsSchema = new Schema<GameStats>({
  presenceName: { type: String, required: true },
  week: { type: Date, required: true },
  timeMilliseconds: { type: Number, required: true },
})

export const GameStatsModel = model<GameStats>('GameStats', GameStatsSchema)
