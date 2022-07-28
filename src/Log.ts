class Log {
  // eslint-disable-next-line no-unused-vars
  values: { type: 'log' | 'error', message: string, line: number }[]
  constructor () {
    this.values = []
  }

  add (log: any) {
    this.values.push(log)
  }

  error (message: string, line: number) {
    this.values.push({
      type: 'error',
      message: message,
      line: line
    })
  }
}

const globalLog = new Log()

export default Log
export { globalLog }
