import { Usuario } from './usuario'
import * as chalk from 'chalk'

class UsuariosLista {
  private static instance: UsuariosLista
  private lista: Usuario[] = []

  private constructor () {}

  public static getInstance () {
    return this.instance || (this.instance = new this())
  }

  public agregar (usuario: Usuario): Usuario {
    console.log(
      `${chalk.cyan('[Usuarios Lista]')} Agregando usuario:`,
      usuario
    )
    this.lista.push(usuario)
    return usuario
  }

  public actualizarUsuario (
    id: string,
    usuarioID: number,
    cotizaciones: number[]
  ) {
    console.log(
      `${chalk.cyan(
        '[Usuarios Lista]'
      )} Actualizando usuario ${usuarioID} con múltiples cotizaciones.`
    )
    for (const usuario of this.lista) {
      if (usuario.id === id) {
        usuario.idDb = usuarioID
        usuario.cotizaciones = [...cotizaciones]
        console.log(
          `${chalk.cyan('[Usuarios Lista]')} Usuario actualizado:`,
          usuario
        )
        break
      }
    }
  }

  public getLista (): Usuario[] {
    return this.lista.filter((u) => u.idDb !== null)
  }

  public getUsuario (id: string): Usuario | undefined {
    console.log(
      `${chalk.cyan(
        '[Usuarios Lista]'
      )} Obteniendo usuario con client ID: ${id}`
    )
    return this.lista.find((u) => u.id === id)
  }

  public borrarUsuario (id: string): Usuario | undefined {
    const tempUser = this.getUsuario(id)
    this.lista = this.lista.filter((u) => u.id !== id)
    return tempUser
  }

  public getUsuarioByDbId (id: number): Usuario[] | undefined {
    console.log(
      `${chalk.cyan('[Usuarios Lista]')} Obteniendo usuarios con ID: ${id}`
    )
    return this.lista.filter((u) => u.idDb == id)
  }
}

export const usuariosConectados = UsuariosLista.getInstance()
