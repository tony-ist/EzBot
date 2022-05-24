import { BaseGuildVoiceChannel, GuildMember } from 'discord.js'
import logger from '../logger'

const log = logger('features/move-members')

export async function moveMembers(members: GuildMember[], targetVoiceChannel: BaseGuildVoiceChannel) {
  const moveMembersPromises = []
  for (const member of members) {
    log.info(`Moving member "${member.displayName}" to channel "${targetVoiceChannel.name}" with id "${targetVoiceChannel.id}"`)
    moveMembersPromises.push(member.edit({ channel: targetVoiceChannel.id }))
  }

  await Promise.all(moveMembersPromises)
}
