import config from '../config'
import * as chalk from 'chalk'
import { handleError } from './error'
import axios from 'axios'
const { api } = config

export const deleteToken = async (token: string, type: 'Android' | 'iOS') => {
  try {
    console.log(
      `${chalk.red('[DELETE TOKEN]')} ${chalk.green(type)}: ${chalk.yellow(
        token
      )}`
    )
    await axios.delete(`${api}/api/tokens/token/${token}/${type}`)
  } catch (error) {
    handleError(error)
  }
}
