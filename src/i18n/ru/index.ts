import type { Translation } from '../i18n-types'

const ru: Translation = {
  commands: {
    ping: {
      description: 'Бот отвечает pong!',
    },
    help: {
      description: 'Отображает помощь по командам.',
    },
    addactivity: {
      description: 'Добавляет новую активность в базу данных.',
    },
  },
  errorOnCommand: 'При выполнении команды произошла ошибка!',
}

export default ru
