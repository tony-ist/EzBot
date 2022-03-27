import { LogLevel } from './types'
import config from './config'

type LoggerFunction = (message: string, props?: any) => void

interface Logger {
  debug: LoggerFunction
  info: LoggerFunction
  warn: LoggerFunction
  error: LoggerFunction
  fatal: LoggerFunction
}

const LogLevelCode: {[level in LogLevel]: number} = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
}

const noopLogger = () => undefined
export default function logger(loggerName: string): Logger {
  const logLevel = LogLevelCode[config.logLevel]
  const formatMessage = (level: string, message: string) => `[${level}:${loggerName}] ${message}`
  return {
    debug: logLevel <= LogLevelCode.DEBUG
      // eslint-disable-next-line no-console
      ? (message, props = '') => console.debug(formatMessage('debg', message), props)
      : noopLogger,
    info: logLevel <= LogLevelCode.INFO
      // eslint-disable-next-line no-console
      ? (message, props = '') => console.info(formatMessage('info', message), props)
      : noopLogger,
    warn: logLevel <= LogLevelCode.WARN
      // eslint-disable-next-line no-console
      ? (message, props = '') => console.warn(formatMessage('warn', message), props)
      : noopLogger,
    error: logLevel <= LogLevelCode.ERROR
      // eslint-disable-next-line no-console
      ? (message, props = '') => console.error(formatMessage('errr', message), props)
      : noopLogger,
    fatal: logLevel <= LogLevelCode.FATAL
      // eslint-disable-next-line no-console
      ? (message, props = '') => console.error(formatMessage('fatl', message), props)
      : noopLogger,
  }
}
