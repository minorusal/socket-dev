export class Usuario {
  public idDb: number | null
  public cotizaciones: number[] | null
  constructor (public id: string) {
    this.idDb = null
    this.cotizaciones = null
  }
}
