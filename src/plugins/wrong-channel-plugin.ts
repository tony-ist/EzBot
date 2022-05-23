import ListenerPlugin from './listener-plugin'
import { Presence } from 'discord.js'
import { isBotInVoiceChannel, isRightChannel, summonToTheChannel } from '../actions/summon-to-the-channel'
import logger from '../logger'

// TODO: Consistent logger naming across plugins/all project
const log = logger('plugins/wrong-channel')

export default class WrongChannelPlugin implements ListenerPlugin {
  async onPresenceUpdate(oldPresence: Presence, newPresence: Presence): Promise<void> {
    const member = newPresence.member
    const guild = newPresence.guild
    const voiceChannel = member?.voice.channel
    const botUserId = newPresence.client.user?.id

    if (botUserId === undefined || botUserId === null) {
      return
    }

    if (guild === undefined || guild === null) {
      return
    }

    const newActivity = newPresence.activities[0]

    // TODO#presenceChange: extract these ifs to some place
    // TODO#presenceChange: revise return or throw error
    // TODO#presenceChange: add debug logs where necessary
    if (newActivity === undefined) {
      return
    }

    const newActivityName = newActivity.name

    if (newActivityName === undefined) {
      return
    }

    if (voiceChannel === undefined || voiceChannel === null) {
      return
    }

    if (await isRightChannel(voiceChannel, newActivityName)) {
      log.debug('issuer is in the right channel')
      return
    }

    if (isBotInVoiceChannel(guild)) {
      log.debug('bot is already in voice channel')
      return
    }

    await summonToTheChannel(voiceChannel, newActivityName, botUserId)
  }
}
