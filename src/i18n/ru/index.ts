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
    summon: {
      description: 'Призывает бота в твой канал. Бот задает вопрос о переносе игроков в правильный канал игры.',
      cannotSummon: 'Не могу призвать бота, сначала запусти игру и/или включи ее отображение!',
      inTheRightChannel: 'Не могу призвать бота, ты в правильном канале!',
      alreadyInChannel: 'Не могу призвать бота, так как он уже в канале!',
      canSummon: 'Призываю бота в канал...',
      userNotInVoiceChannel: 'Не могу призвать бота, ты не в голосовом канале!',
    },
  },
  errorOnCommand: 'При выполнении команды произошла ошибка!',
  yesPhrases: 'да,давай,перекинь,хочу,хотим',
  noPhrases: 'нет,не надо,не,уйди',
}

export default ru
