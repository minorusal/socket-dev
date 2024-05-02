import config from '../config'
import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import * as chalk from 'chalk'
import { generarMensajes } from '../utils'
import { Notificacion, MensajeChatEmpresa } from '../interfaces'
import { sendNotification } from '../lib'
import axios from 'axios'
import { Usuario } from '../classes/usuario'

export const enviaMensajeChatEmpresa = async (cliente: Socket, io: Server) => {
  cliente.on(
    'envia-mensaje-chat-empresa',
    async (payload: MensajeChatEmpresa) => {
      try {
        console.log(
          `${chalk.magenta(
            '[Mensaje chat empresa]'
          )} Recibiendo información para crear mensaje de chat.`
        )
        console.log(
          `${chalk.magenta(
            '[Mensaje chat empresa]'
          )} La información del payload es la siguiente:`
        )
        console.log(
          `${chalk.magenta('[Mensaje chat empresa]')} User: ${chalk.green(
            payload.user
          )} | uuid: ${chalk.green(payload.uuid)} | message: ${chalk.green(
            payload.message
          )}`
        )

        // Enviar a través de la REST API un mensaje a la base de datos
        const { data: mensajeCreado } = await axios.post(
          `${config.api}/api/messages/message`,
          payload
        )
        const { users } = mensajeCreado.results
        const { user } = payload
        let destinatario
        if (user === users.buyer) {
          destinatario = users.seller
        } else {
          destinatario = users.buyer
        }
        // Obtener detalles del usuario de la petición
        const usuario = usuariosConectados.getUsuario(cliente.id)
        if (usuario == null) return
        console.log(
          `${chalk.magenta(
            '[Mensaje chat empresa]'
          )} Se emitirá un evento a todos los usuarios del destino ${destinatario} y al usuario que creó el mensaje`
        )

        let usuariosBuyer: Usuario[] | undefined = usuariosConectados.getUsuarioByDbId(users.buyer)
        if (usuariosBuyer == null) usuariosBuyer = []

        let usuariosSeller: Usuario[] | undefined = usuariosConectados.getUsuarioByDbId(users.seller)
        if (usuariosSeller == null) usuariosSeller = []
        const usuariosNotificacion = [...usuariosBuyer, ...usuariosSeller]

        console.log(
          `${chalk.magenta(
            '[Mensaje chat empresa]'
          )} Se emitirá un evento a los siguientes usuarios:`
        )
        console.log(usuariosNotificacion)

        for (let i = 0; i < usuariosNotificacion.length; i++) {
          const userID = usuariosNotificacion[i].id
          console.log(
            `${chalk.magenta(
              '[Mensaje chat empresa]'
            )} Emitiendo evento para usuario ${chalk.yellow(userID)}`
          )
          io.to(userID).emit('recibe-mensaje-chat-empresa', {
            error: false,
            mensaje: 'Se creo un nuevo mensaje en el chat de empresa',
            data: mensajeCreado
          })
        }
        // Obtener tokens de usuario
        const { data: tokensDeUsuarioRaw } = await axios.get(
          `${config.api}/api/tokens/user/${destinatario}`
        )
        const tokensDeUsuario = tokensDeUsuarioRaw.results.tokens
        for (let i = 0; i < tokensDeUsuario.length; i++) {
          // Data se queda en 0 porque se necesita un number...
          const notificacion: Notificacion = {
            origen: usuario.idDb,
            destino: destinatario,
            tipo: 12,
            data: 0
          }
          const mensaje = generarMensajes(notificacion)
          const tipo = tokensDeUsuario[i].tipo
          const token = tokensDeUsuario[i].token

          await sendNotification(tipo, token, mensaje).catch((error) => {
            console.error(error)
          })
        }
      } catch (error) {
        console.log(`${chalk.red('[Mensaje chat empresa]')} Error:`)
        console.log(`${chalk.red(error)}`)
        io.to(cliente.id).emit('envia-mensaje-chat-empresa-error', {
          error: true,
          message: 'Error al enviar tu mensaje a traves de Axios'
        })
      }
    }
  )
}
