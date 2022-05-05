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
      roleReason: 'Роль для тех, кто наслаждается {roleName}. Создано EzBot.',
      activityCreated: 'Новая активность с именем `{activityName}` создана.\nТакже создана роль с таким же именем.\nТеперь вы можете использовать эту активность для дашборда или привязки к каналу.',
      errors: {
        propActivityNameIsRequired: 'Укажите название активности.',
        propEmojiShouldBeValidEmoji: 'Параметр эмодзи обязателен и должен быть валидным эмодзи. Например `:SC2:`.',
      },
    },
  },
  errorOnCommand: 'При выполнении команды произошла ошибка!',
  yesWords: 'да,давай,перекинь',
  noWords: 'нет,не надо,не',
}

export default ru
