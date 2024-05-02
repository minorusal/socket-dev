import { Socket, Server } from 'socket.io'
import * as chalk from 'chalk'

export const mediaConvert = (cliente: Socket, io: Server) => {
  cliente.on('mediaConvert-completed', async (data) => {
    console.log(`${chalk.red('Media convert ########:')}`, data)
  })
}
