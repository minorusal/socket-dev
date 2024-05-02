export class CotizacionHija {
  cot_padre_id: number
  cotizacion_fecha_entrega: string
  metodo_id: number
  credito_dias?: number
  cotizacion_comentario: string
  descuento: number
  visto: number
  productos: Producto[]
}

export class Producto {
  prod_id: number
  cp_cantidad: number
}
