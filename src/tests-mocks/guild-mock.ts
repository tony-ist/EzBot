import { GuildChannelManagerMock } from './guild-channel-manager-mock'
import { RoleManagerMock } from './role-manager-mock'

export class GuildMock {
  channels = new GuildChannelManagerMock()
  roles: RoleManagerMock | undefined = new RoleManagerMock()
}
