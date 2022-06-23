// https://stackoverflow.com/a/4156516/2863051
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
