import { GuildMock } from '../../../__tests__/mocks/guild-mock'

export class BaseGuildVoiceChannelMock {
  id = 'voice-channel-id'
  guild = new GuildMock()
  members = new Map()
}
