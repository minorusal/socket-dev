import config from '../config'
import { Socket, Server } from 'socket.io'
import { usuariosConectados } from '../classes/usuarios-lista'
import * as chalk from 'chalk'
import { generarMensajes } from '../utils/generar-mensajes'
import { Cotizacion, CotizacionHija, Notificacion } from '../interfaces'
import { sendNotification } from '../lib'
import axios from 'axios'

// Cambiar estatus de cotización
// Esto se utiliza únicamente para cambiar el estatus de una cotización
// o el visto de esta
// Por ejemplo: Cuando pasa de abierta a cerrada
// Sólo recibe estos dos estatus y es lo que regresa en el socket
export const cambiaEstatus = async (cliente: Socket, io: Server) => {
  cliente.on(
    'cambia-estatus',
    async (payload: { cotizacion: number, estatus: number, visto: number }) => {
      console.log(
        `${chalk.green('[Cambiar Estatus]')} Cotización ${
          payload.cotizacion
        } cambiará a estatus ${payload.estatus}`
      )
      console.log(payload)

      const datos = {
        cot_status: payload.estatus,
        visto: payload.visto
      }

      try {
        const { data } = await axios.put(
          `${config.api}/api/cotizacion/${payload.cotizacion}`,
          datos
        )

        if (payload.estatus == 2 || payload.estatus == 4) {
          // ¿Quién hizo el evento?
          const usuario = usuariosConectados.getUsuario(cliente.id)
          if (usuario != null) {
            const { data: usuariosRaw } = await axios.get(
              `${config.api}/api/cotizacion/usuarios/${payload.cotizacion}`
            )
            const { usuarios } = usuariosRaw.results

            let destinatario
            if (payload.estatus == 2) {
              destinatario = usuarios.usuario_comprador
            } else {
              destinatario = usuarios.usuario_vendedor
            }

            // Obtener tokens de usuario
            const { data: tokensDeUsuarioRaw } = await axios.get(
              `${config.api}/api/tokens/user/${destinatario}`
            )
            const tokensDeUsuario = tokensDeUsuarioRaw.results.tokens
            // Enviar una notificación a cada usuario por medio de Apple
            for (let i = 0; i < tokensDeUsuario.length; i++) {
              const data = {
                origen: usuario.idDb,
                destino: destinatario,
                tipo: payload.estatus === 2 ? 9 : 8,
                data: payload.cotizacion
              }
              const mensaje = generarMensajes(data)
              const tipo = tokensDeUsuario[i].tipo
              const token = tokensDeUsuario[i].token
              await sendNotification(tipo, token, mensaje).catch((error) =>
                console.error(error)
              )
            }
          }
        }

        // Obtener datos de amistad del cambio de estatus en la API
        const { friends } = data

        console.log(
          `${chalk.green(
            '[Cambiar estatus]'
          )} Se cambio el estatus de la cotizacion ${payload.cotizacion}`
        )
        io.to(`'${payload.cotizacion}'`).emit('cambio-estatus', {
          error: false,
          mensaje: `Se cambió el estatus de la cotizacion ${payload.cotizacion} a ${payload.estatus}`,
          data: payload,
          friends
        })
      } catch (error) {
        console.log(
          `${chalk.red(
            '[Cambiar estatus]'
          )} Ocurrió un error al cambiar el estatus de la cotización ${
            payload.cotizacion
          }`
        )
        io.to(`'${payload.cotizacion}'`).emit('cambio-estatus', {
          error: true,
          mensaje: `Error: No se cambió el estatus de la cotizacion ${payload.cotizacion}`,
          data: payload,
          friends: null
        })
      }
    }
  )
}

// Crear cotización
export const creaCotizacion = async (cliente: Socket, io: Server) => {
  // Se debe de recibir lo que recibe por body la REST API
  cliente.on('crea-cotizacion', async (payload: Cotizacion) => {
    try {
      console.log(
        `${chalk.green('[Crea Cotización]')} Con el siguiente payload:`
      )
      console.log(payload)
      // Crear la cotización hija
      const { data } = await axios.post(
        `${config.api}/api/cotizacion`,
        payload
      )
      const { results } = data

      const cotizacionesCreadas = results
      console.log(`${chalk.green('[Crea Cotización]')} Cotizaciones creadas:`)
      console.log(cotizacionesCreadas)

      const usuario = usuariosConectados.getUsuario(cliente.id)
      if (usuario != null) {
        // Iterar cada cotización
        for (let i = 0; i < cotizacionesCreadas.length; i++) {
          const cotizacionCreada = cotizacionesCreadas[i]
          const {
            usuario_comprador_id: compradorID,
            usuario_vendedor_id: vendedorID
          } = cotizacionCreada
          // Obtener tokens de usuario
          const { data: tokensDeUsuarioRaw } = await axios.get(
            `${config.api}/api/tokens/user/${vendedorID}`
          )
          const tokensDeUsuario = tokensDeUsuarioRaw.results.tokens
          // Enviar una notificación a cada usuario por medio de su plataforma
          for (let j = 0; j < tokensDeUsuario.length; j++) {
            const tipo = tokensDeUsuario[j].tipo
            const token = tokensDeUsuario[j].token
            let destinatario
            if (usuario.idDb === cotizacionCreada.usuario_comprador_id) {
              destinatario = cotizacionCreada.usuario_vendedor_id
            } else {
              destinatario = cotizacionCreada.usuario_comprador_id
            }
            const notificacion: Notificacion = {
              origen: usuario.idDb,
              destino: destinatario,
              tipo: 6,
              data: cotizacionCreada.cotizacion_id
            }
            const mensaje = generarMensajes(notificacion)
            await sendNotification(tipo, token, mensaje).catch((error) =>
              console.error(error)
            )
          }

          // Obtener usuarios con ese ID
          const vendedor = usuariosConectados.getUsuarioByDbId(vendedorID)
          const comprador = usuariosConectados.getUsuarioByDbId(compradorID)

          let usuarios: any[] = []
          if (vendedor != null) {
            usuarios = [...vendedor]
          }
          if (comprador != null) {
            usuarios = [...usuarios, ...comprador]
          }
          if (usuarios) {
            for (let j = 0; j < usuarios.length; j++) {
              // FIXME: Revisar con iOS si esto funciona
              const userID = usuarios[j].id
              console.log(
                `${chalk.green(
                  '[Crea Cotización]'
                )} Enviando evento a usuario ${userID}.`
              )
              io.to(userID).emit('cotizacion-creada', {
                error: false,
                mensaje: 'Se creo una cotizacion',
                data
              })
            }
          }
        }
      }
    } catch (error) {
      console.log(
        `${chalk.red('[Crea Cotización]')} No se pudo crear la cotización.`
      )
      // FIXME: Revisar con iOS si esto funciona
      io.to(cliente.id).emit('cotizacion-creada', {
        error: true,
        mensaje: 'No se pudo crear la cotizacion',
        data: null
      })
    }
  })
}

// Crear cotización hija
// Esto se utiliza para actualizar una cotización y así crear una cotización hija
// durante el proceso de negociación
// Al hacer esto se regresa información de la última hija creada
// así como datos de la conversión de moneda
export const creaCotizacionHija = async (cliente: Socket, io: Server) => {
  cliente.on('crea-hija', async (payload: CotizacionHija) => {
    console.log(
      `${chalk.green(
        '[Crea Cotización Hija]'
      )} Se creará una cotización hija para la cotización padre ${
        payload.cot_padre_id
      }`
    )
    console.log(payload)

    try {
      // Crear la cotización hija
      const { data } = await axios.put(
        `${config.api}/api/cotizacion/update/${payload.cot_padre_id}`,
        payload
      )
      console.log(
        `${chalk.green('[Crea Cotización Hija]')} Se creó una cotización hija.`
      )

      // Obtener detalles de la cotización hija
      // y emitirlos al socket de la cotización padre

      const { data: hijaCreada } = await axios.get(
        `${config.api}/api/cotizacion/actualizacion/${payload.cot_padre_id}`
      )

      console.log(
        `${chalk.green(
          '[Crea Cotización Hija]'
        )} Obtiene detalles de la cotización hija recién creada:`
      )
      console.log(hijaCreada)

      const { hija } = hijaCreada

      // Obtener tokens de usuario

      // Obtener usuario de websocket y su ID DB
      const usuario = usuariosConectados.getUsuario(cliente.id)
      if (usuario != null) {
        const usuarioID = Number(usuario.idDb)
        let destinatario
        if (usuarioID === data.results.usuario_comprador_id) {
          destinatario = data.results.usuario_vendedor_id
        } else {
          destinatario = data.results.usuario_comprador_id
        }
        const { data: tokensDeUsuarioRaw } = await axios.get(
          `${config.api}/api/tokens/user/${destinatario}`
        )
        const tokensDeUsuario = tokensDeUsuarioRaw.results.tokens

        const notificacion: Notificacion = {
          origen: Number(usuario.idDb),
          destino: destinatario,
          tipo: 7,
          data: hija.cot_id
        }
        const mensaje = generarMensajes(notificacion)
        // Enviar una notificación por medio de su plataforma
        for (let i = 0; i < tokensDeUsuario.length; i++) {
          const tipo = tokensDeUsuario[i].tipo
          const token = tokensDeUsuario[i].token
          await sendNotification(tipo, token, mensaje).catch((error) =>
            console.error(error)
          )
        }
      }

      console.log(
        `${chalk.green(
          '[Crea Cotización Hija]'
        )} Se creó una cotización hija. Emitiendo a ${payload.cot_padre_id}`
      )
      io.to(`'${payload.cot_padre_id}'`).emit('cotizacion-actualizada', {
        error: false,
        mensaje: `Se creo una cotización hija para la cotizacion padre ${payload.cot_padre_id}`,
        data: hija
      })
    } catch (error) {
      console.log(
        `${chalk.red(
          '[Crea Cotización Hija]'
        )} No fue posible crear una cotización hija.`
      )
      io.to(`'${payload.cot_padre_id}'`).emit('cotizacion-actualizada', {
        error: true,
        mensaje: 'No se pudo actualizar la cotizacion',
        data: null
      })
    }
  })
}
