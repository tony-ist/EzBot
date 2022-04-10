import { Schema, model } from 'mongoose'

export interface ReactionMessage {
  id: string
}

const ReactionMessageSchema = new Schema<ReactionMessage>({
  id: { type: String, required: true },
})

export const ReactionMessageModel = model<ReactionMessage>('ReactionMessage', ReactionMessageSchema)
