import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export function now() {
  return dayjs().utc().format()
}

export function startOfMonth() {
  return dayjs.utc().startOf('months').format()
}

export function endOfMonth() {
  return dayjs.utc().endOf('months').format()
}

export function dateTimeZone7(date) {
  return dayjs(date).utc().add(7, 'h').format()
}
