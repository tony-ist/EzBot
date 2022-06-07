import type { Translation } from '../i18n-types'

const ru: Translation = {
  commands: {
    ping: {
      description: 'Бот отвечает pong!',
    },
    help: {
      description: 'Отображает помощь по командам.',
    },
    game: {
      description: 'Отображает название игры, в которую ты играешь.',
      notPlayingAnyGame: 'Ты не играешь ни в какую игру в данный момент или отключено ее отображение.',
    },
    addactivity: {
      description: 'Добавляет новую активность в базу данных.',
      roleReason: 'Роль для тех, кто наслаждается {roleName}. Создано EzBot.',
      activityCreated: 'Новая активность с именем "{activityName}" создана.\nТакже создана роль с таким же именем.\nТеперь вы можете использовать эту активность для дашборда или привязки к каналу.',
      options: {
        activity: 'Название новой Активности',
        emoji: 'Эмодзи из канала #dashboard',
      },
      errors: {
        propActivityNameIsRequired: 'Укажите название активности.',
        propEmojiShouldBeValidEmoji: 'Параметр эмодзи обязателен и должен быть валидным эмодзи. Например ":SC2:".',
        activityWithThatNameExists: 'Активность с названием "{activityName}" уже существует.',
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
    connectchannel: {
      description: 'Присоединяет выбранный канал к выбранным активностям.',
      options: {
        channel: 'Voice channel to connect to specified activities',
      },
      multiselect: {
        placeholder: 'Ничего не выбрано',
        selectActivities: 'Выбери активности...',
      },
      buttons: {
        header: 'Канал "{channelName}" будет присоединен к активностям: "{activityNames}". Ты уверен?',
        submit: 'Погнали',
        cancel: 'А можно не надо',
      },
      result: {
        success: 'Канал "{channelName}" присоединен к активностям: "{activityNames}".',
        cancelled: 'Отменено.',
      },
    },
    showactivities: {
      description: 'Отображает все активности.',
      formatActivity: '**Активность: {activityName}**\nЭмодзи: {emoji}\nРоль: {roleName}\nId Роли: {roleId}\nКанал: {channelName}\nID канала: {channelId}\nИгры: {presenceNames}\n',
    },
  },
  errorOnCommand: 'При выполнении команды произошла ошибка!',
  yesPhrases: 'да,давай,перекинь,хочу,хотим',
  noPhrases: 'нет,не надо,не,уйди',
}

export default ru
