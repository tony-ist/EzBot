import ListenerPlugin from './listener-plugin'
import { Presence } from 'discord.js'
import { summonToTheChannel } from '../features/summon-to-the-channel'
import logger from '../logger'

const log = logger('plugins/wrong-channel')

export default class WrongChannelPlugin implements ListenerPlugin {
  async onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
    const member = newPresence.member
    const guild = newPresence.guild
    const voiceChannel = member?.voice.channel
    const botUserId = newPresence.client.user?.id
    const newActivity = newPresence.activities[0]

    // TODO#presenceChange: extract these ifs to some place
    if (botUserId === undefined || botUserId === null) {
      throw new Error(`botUserId id ${botUserId}`)
    }

    if (guild === undefined || guild === null) {
      throw new Error(`guild id ${guild}`)
    }

    if (newActivity === undefined) {
      log.debug(`newActivity is undefined because the user "${member?.user.username}" quit the game. Skipping...`)
      return
    }

    const newActivityName = newActivity.name

    if (voiceChannel === undefined || voiceChannel === null) {
      log.debug(`voiceChannel is ${voiceChannel} because the user "${member?.user.username}" is not in the voice channel. Skipping...`)
      return
    }

    await summonToTheChannel(voiceChannel, newActivityName, botUserId)
  }
}
