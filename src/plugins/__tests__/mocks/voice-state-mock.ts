import { GuildMemberMock } from '../../../__tests__/mocks/guild-member-mock'

export class VoiceStateMock {
  channelId: string | null = 'channel'
  member: GuildMemberMock | null = new GuildMemberMock()
}
