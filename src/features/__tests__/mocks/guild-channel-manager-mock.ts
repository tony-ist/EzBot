import { NonThreadGuildBasedChannelMock } from './non-thread-guild-based-channel-mock'

export class GuildChannelManagerMock {
  fetch: () => Promise<NonThreadGuildBasedChannelMock | null> = jest.fn(async () => new NonThreadGuildBasedChannelMock())
}
