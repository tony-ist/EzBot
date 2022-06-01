import { NonThreadGuildBasedChannelMock } from './non-thread-guild-based-channel-mock'

export class GuildChannelManagerMock {
  fetch = jest.fn(async () => new NonThreadGuildBasedChannelMock())
}
