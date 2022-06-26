import { I18n } from '../../i18n'
import { formatMs, getMonday } from '../../utils/date'
import { GameStatsModel } from '../../models/game-stats'

export async function gameStatsFormatter() {
  const messageParts: string[] = [I18n.commands.stats.game.thisWeek()]
  const thisMonday = getMonday(new Date())
  const gameStats = await GameStatsModel.find({ week: thisMonday }).sort({ timeMilliseconds: 'desc' })

  for (const stat of gameStats) {
    const timeString = formatMs(stat.timeMilliseconds)
    messageParts.push(I18n.commands.stats.game.presenceName({ presenceName: stat.presenceName }))
    messageParts.push(timeString)
  }

  if (messageParts.length === 1) {
    return I18n.commands.stats.game.noStats()
  } else {
    return messageParts.join('\n')
  }
}
