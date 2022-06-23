/**
 * Taken and modified from https://stackoverflow.com/a/4156516/2863051
 *
 * Returns the start of the monday of the current week for the given date.
 *
 * For example for 2022-06-20 01:02:03.004 it will be 2022-06-20 00:00:00.000
 * @param date The last monday before this date is returned.
 */
export function getMonday(date: Date) {
  const day = date.getDay()
  const offset = day === 0 ? -6 : 1
  const dayOfMonth = date.getDate()
  const monday = dayOfMonth - day + offset // adjust when day is sunday
  const newDate = new Date(date)
  newDate.setDate(monday)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

function padWithZero(num: number) {
  return ('00' + num.toString()).slice(-2)
}

/**
 * Formats given time in milliseconds as DAYS:HOURS:MINUTES:SECONDS
 * @param timeMs Time in milliseconds
 */
export function formatMs(timeMs: number) {
  const seconds = Math.floor(timeMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const displaySeconds = padWithZero(seconds - minutes * 60)
  const displayMinutes = padWithZero(minutes - hours * 60)
  const displayHours = padWithZero(hours - days * 24)

  return `${days}:${displayHours}:${displayMinutes}:${displaySeconds}`
}
