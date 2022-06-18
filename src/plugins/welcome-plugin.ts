import ListenerPlugin from './listener-plugin'
import { GuildMember } from 'discord.js'
import logger from '../logger'
import { I18n } from '../i18n'

const log = logger('plugins/welcome')

export default class WelcomePlugin implements ListenerPlugin {
  async onGuildMemberAdd(member: GuildMember) {
    log.info(`New member "${member.displayName}" joined the server`)
    await member.send(I18n.welcomeMessage())
  }
}
