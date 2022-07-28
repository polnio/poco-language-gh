import { globalLog } from './Log'

class ErrorHandler {
  log = globalLog
  throw (message: string, line: number, column: number) {
    const error = line && column
      ? `\n\n${message} -- line: ${line}, column: ${column}\n`
      : `\n\n${message}\n`

    try {
      throw new Error(error)
    } catch (e) {
      console.error(e)
      this.log.error(e, line)
    }
  }
}

export default ErrorHandler
