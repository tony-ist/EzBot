import { blue, gray, magenta, red, yellow } from 'nanocolors'
import config from './config'
import { LogLevel } from './types'

type LoggerFunction = (message: string, props?: any) => void

interface Logger {
  debug: LoggerFunction
  info: LoggerFunction
  warn: LoggerFunction
  error: LoggerFunction
  fatal: LoggerFunction
}

const levelToCode: {[level in LogLevel]: number} = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
}

const levelToLabel: {[level in LogLevel]: string} = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
}

const levelToColor: {[level in LogLevel]: (msg: string) => string} = {
  DEBUG: gray,
  INFO: blue,
  WARN: yellow,
  ERROR: red,
  FATAL: magenta,
}

const levelToLogFunc: {[level in LogLevel]: LoggerFunction} = {
  // eslint-disable-next-line no-console
  DEBUG: console.debug,
  // eslint-disable-next-line no-console
  INFO: console.info,
  // eslint-disable-next-line no-console
  WARN: console.warn,
  // eslint-disable-next-line no-console
  ERROR: console.error,
  // eslint-disable-next-line no-console
  FATAL: console.error,
}

const LOGGER_HEAD_PAD_END = 0
const noopLogger = () => undefined
function getLogFunction(loggerName: string, targetLogLevel: LogLevel, currentLogLevel: LogLevel): LoggerFunction {
  // TODO: Use https://nodejs.org/api/async_hooks.html
  const targetLogLevelCode = levelToCode[targetLogLevel]
  const currentLogLevelCode = levelToCode[currentLogLevel]
  if (currentLogLevelCode > targetLogLevelCode) {
    return noopLogger
  }
  const log = levelToLogFunc[targetLogLevel]
  const label = levelToLabel[targetLogLevel]
  const color = levelToColor[targetLogLevel]
  return (message, props = '') => {
    const messageHead = `[${loggerName}:${label}]`.padEnd(LOGGER_HEAD_PAD_END)
    const messageFormatted = `${color(messageHead)} ${message}`
    return log(messageFormatted, props)
  }
}

export default function logger(loggerName: string): Logger {
  return {
    debug: getLogFunction(loggerName, LogLevel.DEBUG, config.logLevel),
    info: getLogFunction(loggerName, LogLevel.INFO, config.logLevel),
    warn: getLogFunction(loggerName, LogLevel.WARN, config.logLevel),
    error: getLogFunction(loggerName, LogLevel.ERROR, config.logLevel),
    fatal: getLogFunction(loggerName, LogLevel.FATAL, config.logLevel),
  }
}
