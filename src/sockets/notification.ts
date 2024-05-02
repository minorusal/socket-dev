import config from '../config'
import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import * as chalk from 'chalk'
import { generarMensajes } from '../utils/generar-mensajes'
import { Notificacion } from '../interfaces'
import { sendNotification } from '../lib'
import { Usuario } from '../classes/usuario'
import axios from 'axios'

export const creaNotifiacion = async (cliente: Socket, io: Server) => {
  cliente.on('crea-notificacion', async (payload: Notificacion) => {
    console.log(
      `${chalk.green(
        '[Crea Notificación]'
      )} Se creará una notificación para el usuario ${payload.destino}:`
    )
    console.log(payload)

    try {
      // Crear la notificación
      const { data } = await axios.post(
        `${config.api}/api/notifications`,
        payload
      )
      console.log(
        `${chalk.green('[Crea Notificación]')} Notificación recién creada.:`
      )

      // ¿Se puede enviar a través de APNs?
      const { tokens } = data.results
      if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
          const tipo = tokens[i].tipo
          const token = tokens[i].token
          const mensaje = generarMensajes(payload)
          await sendNotification(tipo, token, mensaje).catch((error) =>
            console.error(error)
          )
        }
      }

      let usuariosFiltrados: Usuario[] | undefined
      const solicitaCertificacion = 5
      if (payload.tipo === solicitaCertificacion) {
        const { destino } = data.results
        usuariosFiltrados = usuariosConectados.getUsuarioByDbId(destino)
        if (usuariosFiltrados == null) usuariosFiltrados = []
      } else {
        usuariosFiltrados = usuariosConectados.getUsuarioByDbId(payload.destino)
        if (usuariosFiltrados == null) usuariosFiltrados = []
      }
      if (usuariosFiltrados != null) {
        for (let i = 0; i < usuariosFiltrados.length; i++) {
          const userID = usuariosFiltrados[i].id
          console.log(
            `${chalk.green('[Crea Notificación]')} Enviando evento a ${userID}`
          )
          io.to(userID).emit('notificacion-creada', {
            error: false,
            mensaje: 'Se creo una nueva notificacion',
            data: payload
          })
        }
      }
    } catch (error) {
      console.log(
        `${chalk.red(
          '[Crea Notificación]'
        )} No fue posible crear una notificación:`
      )
      io.to(cliente.id).emit('notificacion-creada', {
        error: true,
        mensaje: 'No se pudo crear una nueva notificacion',
        data: null
      })
    }
  })
}
