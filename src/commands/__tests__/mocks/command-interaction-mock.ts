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

class NullMap<K, V> {
  map = new Map<K, V>()

  set(key: K, value: V) {
    this.map.set(key, value)
  }

  get(key: K) {
    const value = this.map.get(key)

    if (value === undefined) {
      return null
    } else {
      return value
    }
  }
}

export class CommandInteractionMock {
  options = new NullMap()

  reply = jest.fn()

  guild: GuildManager | null = new GuildManager()
}
