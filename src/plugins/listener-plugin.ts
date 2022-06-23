import Discord, { GuildMember, MessageReaction, Presence, User, VoiceState } from 'discord.js'
import logger from '../logger'

type ListenerFunction = (...args: any[]) => Promise<void>

const log = logger('plugins/listener')

export default interface ListenerPlugin {
  onPresenceUpdate?: (
    oldPresence: Presence,
    newPresence: Presence,
  ) => Promise<void>

  onReady?: (discordClient: Discord.Client) => Promise<void>

  onInteractionCreate?: (interaction: Discord.Interaction) => Promise<void>

  onMessageReactionAdd?: (reaction: MessageReaction, user: User) => Promise<void>

  onMessageReactionRemove?: (reaction: MessageReaction, user: User) => Promise<void>

  onGuildMemberAdd?: (member: GuildMember) => Promise<void>

  onVoiceStateUpdate?: (oldState: VoiceState, newState: VoiceState) => Promise<void>
}

export function wrapErrorHandling(f: ListenerFunction): ListenerFunction {
  return async (...args) => {
    try {
      await f(...args)
    } catch (error) {
      log.error('There was an error in the listener:', error)
    }
  }
}
