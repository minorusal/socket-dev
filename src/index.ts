import { server } from './classes/server'
import * as cors from 'cors'
import { json } from 'body-parser'
import config from './config'
import * as chalk from 'chalk'

server.app.use(json())
server.app.use(cors({ origin: true, credentials: true }))

server.start(() => {
  console.log(
    `${chalk.yellowBright(
      '[MC Sockets]'
    )} Servidor corriendo en el puerto ${chalk.green(`${config.puerto}`)}`
  )
})
