import { NonThreadGuildBasedChannelMock } from './non-thread-guild-based-channel-mock'

export class GuildChannelManagerMock {
  fetch: (channelId: string) => Promise<NonThreadGuildBasedChannelMock | null> =
  jest.fn(async (channelId: string) => new NonThreadGuildBasedChannelMock())
}
