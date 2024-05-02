import { Notificacion } from './notificacion'

export class Mensaje implements Notificacion {
  mensaje: string
  origen: number | null
  destino: number
  tipo: number
  data: number
}
