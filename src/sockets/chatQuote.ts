import config from '../config'
import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import * as chalk from 'chalk'
import { generarMensajes } from '../utils'
import { sendNotification } from '../lib'
import { Notificacion, MensajeChat } from '../interfaces'
import axios from 'axios'

// Crea mensaje de chat de cotización
export const mensaje = async (cliente: Socket, io: Server) => {
  cliente.on('mensaje', async (payload: MensajeChat) => {
    console.log(`${chalk.green('[Mensaje recibido]')}:`, payload)

    let requestToApi = {}
    let responseApi = null
    let usuarioEvento
    let informacionOut
    let payloadCotizacion
    let userNotNull
    let destinatarioOut
    let tokensDeUsuarioOut
    let mensajeOut

    try {
      const a = {
        cotizacion: payload.cotizacion,
        usuario: Number(payload.de),
        comentario: payload.cuerpo,
        origen: Number(payload.origen)
      }

      requestToApi = a

      const { data } = await axios.post(
        `${config.api}/api/cotizacion/comentarios`,
        a
      )

      responseApi = data

      const { fecha_creacion, comentario_id } = data.results

      // ¿Quién hizo el evento?
      const usuario = usuariosConectados.getUsuario(cliente.id)
      usuarioEvento = usuario

      const informacion = {
        ...payload,
        fecha_creacion,
        comentario_id
      }

      informacionOut = informacion
      console.log(
        `${chalk.green('[Mensaje]')} Se emitirá el evento a ${
          payload.cotizacion
        }`
      )

      payloadCotizacion = payload.cotizacion
      io.to(`'${payload.cotizacion}'`).emit('mensaje-nuevo', informacion)

      if (usuario != null) {
        const { data: usuariosRaw } = await axios.get(
          `${config.api}/api/cotizacion/getUsuarios/${payload.cotizacion}`
        )
        userNotNull = usuariosRaw
        const { usuarios } = usuariosRaw.results

        let destinatario
        if (usuario.idDb == usuarios.usuario_comprador) {
          destinatario = usuarios.usuario_vendedor
        } else {
          destinatario = usuarios.usuario_comprador
        }
        destinatarioOut = destinatario
        // Obtener tokens de usuario
        const { data: tokensDeUsuarioRaw } = await axios.get(
          `${config.api}/api/tokens/user/${destinatario}`
        )

        tokensDeUsuarioOut = tokensDeUsuarioRaw
        const tokensDeUsuario = tokensDeUsuarioRaw.results.tokens
        for (let i = 0; i < tokensDeUsuario.length; i++) {
          const notificacion: Notificacion = {
            origen: usuario.idDb,
            destino: destinatario,
            tipo: 10,
            data: payload.cotizacion
          }
          const mensaje = generarMensajes(notificacion)

          mensajeOut = mensaje
          const tipo = tokensDeUsuario[i].tipo
          const token = tokensDeUsuario[i].token
          await sendNotification(tipo, token, mensaje).catch((error) =>
            console.log(error)
          )
        }
      }
    } catch (error) {
      console.log(`${chalk.red('[Mensaje]')} No se pudo enviar el mensaje.`)
      io.to(cliente.id).emit('mensaje-nuevo', {
        de: 'bot',
        requestToApi,
        responseApi,
        usuarioEvento,
        informacionOut,
        payloadCotizacion,
        userNotNull,
        destinatarioOut,
        tokensDeUsuarioOut,
        mensajeOut,
        cuerpo: `algo salio mal, error: ${JSON.stringify(error.message)}`
      })
    }
  })
}

// Eliminar mensaje de chat de cotización
export const eliminar = async (cliente: Socket, io: Server) => {
  cliente.on(
    'eliminar',
    async (payload: { cotizacion: number, comentarios: number[] }) => {
      console.log(
        `${chalk.green('[Eliminar mensajes]')} ${payload.comentarios}`
      )
      console.log(payload)

      try {
        const { data } = await axios.delete(
          `${config.api}/api/cotizacion/comentarios`,
          {
            data: payload
          }
        )
        const { eliminados } = data
        console.log(
          `${chalk.green(
            '[Eliminar mensajes]'
          )} Se eliminó el mensaje. Enviando evento a ${payload.cotizacion}`
        )
        io.to(`'${payload.cotizacion}'`).emit('mensaje-eliminado', {
          data: `Se eliminaron los mensajes ${eliminados}`,
          eliminados
        })
      } catch (error) {
        console.log(
          `${chalk.red('[Eliminar mensajes]')} No se pudo elimiminar el mensaje`
        )
        io.to(`'${payload.cotizacion}'`).emit('mensaje-eliminado', {
          data: `Error: No se eliminaron los mensajes ${payload.comentarios},`,
          eliminados: []
        })
      }
    }
  )
}
