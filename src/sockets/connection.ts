import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import { Usuario } from '../classes/usuario'
import * as chalk from 'chalk'

export const conectarCliente = (cliente: Socket) => {
  const usuario = new Usuario(cliente.id)
  usuariosConectados.agregar(usuario)
}

export const desconectar = (cliente: Socket, io: Server) => {
  cliente.on('disconnect', () => {
    console.log(`${chalk.yellow('[Cliente desconectado]')} ${cliente.id}`)
    usuariosConectados.borrarUsuario(cliente.id)
    io.emit('usuarios-activos', usuariosConectados.getLista())
  })
}
