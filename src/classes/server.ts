import config from '../config'
import * as express from 'express'
import * as socketIO from 'socket.io'
import * as http from 'http'
import * as socket from '../sockets'
import * as chalk from 'chalk'

class Server {
  private static instance: Server
  public readonly app: express.Application = express()
  public readonly port: number = config.puerto

  private readonly httpServer: http.Server = new http.Server(this.app)
  public readonly io: socketIO.Server = socketIO(this.httpServer)

  private constructor () {
    this.io.origins('*:*')
    this.escucharSockets()
  }

  public static getInstance () {
    // Esto es un patrón singleton
    // Retorna this._instance es diferente a undefined o null
    // Caso contrario this._instance será inicializado con un new this() y se
    // retornará this._instance
    return this.instance || (this.instance = new this())
  }

  private escucharSockets () {
    console.log(`${chalk.magenta('[Server]')} Escuchando conexiones`)
    this.io.on('connection', (cliente) => {
      // Conectar cliente
      socket.conectarCliente(cliente)

      // Mensajes
      socket.mensaje(cliente, this.io)

      // Eliminar mensajes
      socket.eliminar(cliente, this.io)

      // Configurar usuario
      socket.configurarUsuario(cliente, this.io)

      // Cambiar estado
      socket.cambiaEstatus(cliente, this.io)

      // Crear cotización
      socket.creaCotizacion(cliente, this.io)

      // Crear cotización hija
      socket.creaCotizacionHija(cliente, this.io)

      // Crear notificaciones
      socket.creaNotifiacion(cliente, this.io)

      // Mensajes de chat de empresa y usuario
      socket.enviaMensajeChatEmpresa(cliente, this.io)

      // Obtener usuarios
      socket.obtenerUsuarios(cliente, this.io)

      socket.mediaConvert(cliente, this.io)

      // En caso de que se necesite una nueva funcionalidad de socket se tendrá
      // que definir dentro del módulo de sockets, donde tendrá que ser
      // exportada. Dentro de este archivo,  tenemos
      // import * as socket from "../sockets";
      // De esta manera tenemos acceso a todo lo que está dentro del módulo de
      // sockets, sólo se necesita
      // socket.mifuncion(cliente, this.io)

      // Desconetar
      socket.desconectar(cliente, this.io)
    })
  }

  start (callback: any) {
    this.httpServer.listen(this.port, callback)
  }
}

export const server = Server.getInstance()
