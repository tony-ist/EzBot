import { NullMap } from '../../../utils/null-map'

class RolesManager {
  create = jest.fn(async ({ name }: {name: string, reason: string}) => {
    return {
      id: 'role_id_mock_' + name,
    }
  })
}

class GuildManager {
  roles = new RolesManager()
}

export class CommandInteractionMock {
  options = new NullMap()

  reply = jest.fn()

  guild: GuildManager | null = new GuildManager()
}
