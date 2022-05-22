import ListenerPlugin from './listener-plugin'
import Discord, { GuildMember, MessageReaction, Role, User } from 'discord.js'
import logger from '../logger'
import { ActivityModel } from '../models/activity'
import { ReactionMessageModel } from '../models/reaction-message'

const log = logger('role-plugin')

export default class RolePlugin implements ListenerPlugin {
  discordClient: Discord.Client

  constructor(discordClient: Discord.Client) {
    this.discordClient = discordClient
  }

  async onMessageReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
    if (!await this.isReactionOnReactionMessage(reaction)) {
      return
    }

    const role = await this.getRoleByReaction(reaction)
    const member = await this.getMemberByUser(reaction, user)
    await member.roles.add(role)

    log.debug(`Added role "${role.name}" to user "${user.username}"`)
  }

  async onMessageReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
    if (!await this.isReactionOnReactionMessage(reaction)) {
      return
    }

    const role = await this.getRoleByReaction(reaction)
    const member = await this.getMemberByUser(reaction, user)
    await member.roles.remove(role)

    log.debug(`Removed role "${role.name}" from user "${user.username}"`)
  }

  async getRoleByReaction(reaction: MessageReaction): Promise<Role> {
    const roleManager = reaction.message.guild?.roles

    if (roleManager === undefined) {
      throw new Error('reaction.message.guild?.roles is undefined')
    }

    if (reaction.emoji.id === null) {
      throw new Error('reaction.emoji.id is undefined, only custom emoji are supported')
    }

    const activity = await ActivityModel.findOne({ emoji: reaction.emoji.id })

    if (activity === null) {
      throw new Error(`Activity for emoji with id "${reaction.emoji.id}" and name "${reaction.emoji.name}" was not found`)
    }

    const roles = await roleManager.fetch()

    const role = roles.find((r) => r.id === activity.roleId)

    if (role === undefined) {
      throw new Error(`Role for activity with name "${activity.name}" was not found`)
    }

    return role
  }

  async getMemberByUser(reaction: MessageReaction, user: User): Promise<GuildMember> {
    const guildMemberManager = reaction.message.guild?.members

    if (guildMemberManager === undefined) {
      throw new Error('reaction.message.guild?.members is undefined')
    }

    return await guildMemberManager.fetch(user)
  }

  async isReactionOnReactionMessage(reaction: MessageReaction): Promise<boolean> {
    const reactionMessage = await ReactionMessageModel.findOne({ id: reaction.message.id })
    return reactionMessage !== null
  }
}
