import { I18n } from '../../i18n'
import { formatMs, getMonday } from '../../utils/date'
import { GameStatsModel } from '../../models/game-stats'
import { MAX_DISPLAYED_GAME_STATS } from '../../constants'

export async function gameStatsFormatter() {
  const messageParts: string[] = [I18n.commands.stats.game.thisWeek()]
  const thisMonday = getMonday(new Date())
  const gameStats = await GameStatsModel.find({ week: thisMonday }).sort({ timeMilliseconds: 'desc' })
  const gameStatsToDisplay = gameStats
    .filter(stat => stat.presenceName !== 'Custom Status')
    .slice(0, MAX_DISPLAYED_GAME_STATS)

  for (const stat of gameStatsToDisplay) {
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
