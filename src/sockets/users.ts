import config from '../config'
import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import * as chalk from 'chalk'
import axios from 'axios'

export const configurarUsuario = (cliente: Socket, io: Server) => {
  cliente.on(
    'configurar-usuario',
    (
      payload: { usuarioId: number, cotizacionesId: number[] },
      callback: Function
    ) => {
      console.log(
        `${chalk.green('[Configurar Usuario]')} Se configura el usuario ${
          payload.usuarioId
        } para las cotizaciones ${chalk.yellow(
          `[${payload.cotizacionesId.join(',')}]`
        )}`
      )

      // Actualizar usuario con sus múltiples cotizaciones
      usuariosConectados.actualizarUsuario(
        cliente.id,
        payload.usuarioId,
        payload.cotizacionesId
      )

      // Unirse a cada cotización
      const { cotizacionesId: cotizaciones } = payload
      cotizaciones.forEach((c) =>
        console.log(
          `${chalk.green('[Configurar Usuario]')} Uniendose a cotización '${c}'`
        )
      )
      cotizaciones.forEach((c) => cliente.join(`'${c}'`))

      io.emit('usuarios-activos', { usuarios: usuariosConectados.getLista() })

      callback({
        ok: true,
        mensaje: `Usuario ${payload.usuarioId}, configurado`
      })
    }
  )
}

export const obtenerUsuarios = (cliente: Socket, io: Server) => {
  cliente.on('obtener-usuarios', () => {
    io.to(cliente.id).emit('usuarios-activos', usuariosConectados.getLista())
  })
}
