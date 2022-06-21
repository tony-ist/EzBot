import { GuildMock } from '../../../tests-mocks/guild-mock'

export class BaseGuildVoiceChannelMock {
  id = 'voice-channel-id'
  guild = new GuildMock()
  members = new Map()
}
