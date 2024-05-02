import { Notificacion, Mensaje } from '../interfaces'

export const generarMensajes = (payload: Notificacion): Mensaje => {
  enum Tipo {
    AmistadAgrego = 1,
    AmistadAcepto,
    Like,
    Follow,
    SolicitaCertificacion,
    CotizacionNueva,
    CotizacionHija,
    CotizacionCompradorOk,
    CotizacionDeal,
    MensajeChat,
    InvitacionEvento,
    MensajeChatEmpresa,
  }
  let mensaje: string

  switch (payload.tipo) {
    case Tipo.AmistadAgrego:
      mensaje = 'Alguien te agregó a su red'
      break
    case Tipo.AmistadAcepto:
      mensaje = 'Alguien aceptó tu invitación'
      break
    case Tipo.Like:
      mensaje = 'A alguien le gustó tu publicación'
      break
    case Tipo.Follow:
      mensaje = 'Alguien te ha seguido'
      break
    case Tipo.SolicitaCertificacion:
      mensaje = 'Se solicita tu certificación'
      break
    case Tipo.CotizacionNueva:
      mensaje = 'Haz recibido una nueva cotización'
      break
    case Tipo.CotizacionHija:
      mensaje = 'Haz recibido una nueva actualización'
      break
    case Tipo.CotizacionCompradorOk:
      mensaje = 'Tu comprador acaba de hacer deal'
      break
    case Tipo.CotizacionDeal:
      mensaje = 'Se acaba de hacer deal en una cotización'
      break
    case Tipo.MensajeChat:
      mensaje = 'Haz recibido un nuevo mensaje de chat'
      break
    case Tipo.InvitacionEvento:
      mensaje = 'Haz recibido una invitación a un evento'
      break
    case Tipo.MensajeChatEmpresa:
      mensaje = 'Haz recibido un nuevo mensaje de chat para pedir información'
      break
    default:
      mensaje = 'Tienes una nueva notificación'
      break
  }
  const notificacion: Mensaje = {
    ...payload,
    mensaje
  }
  return notificacion
}
