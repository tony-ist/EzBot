import { Collection } from 'discord.js'
import { RoleMock } from './role-mock'

export class RoleManagerMock {
  fetch: () => Collection<string, RoleMock> = jest.fn(() => new Collection())
}
