import * as chalk from 'chalk'

export const handleError = (error: Error) => {
  console.error(`${chalk.red('[error]')} ${error.message}`)
  console.error(`${error.stack}`)
}
