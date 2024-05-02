export class Cotizacion {
  usu_id_comprador: number
  cot_delivery: string
  cot_comentario: string
  cmetodo_id: number
  credito_dias?: number
  address_id: number
  products: Product[]
}

export class Product {
  prod_id: number
  cp_cantidad: number
  comentario?: string
}
