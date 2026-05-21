export interface ShopifyAddress {
  address1: string | null
  city: string | null
  province: string | null
  country_name: string | null
  zip: string | null
}

export interface CustomerRow {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  orders_count: number
  total_spent: string
  created_at: string
  default_address: ShopifyAddress | null
}

export interface ShopifyOrder {
  id: number
  name: string
  created_at: string
  financial_status: string
  fulfillment_status: string | null
  total_price: string
  line_items: { title: string; quantity: number }[]
}

export interface CustomerDetailResponse {
  customer: CustomerRow | null
  orders: ShopifyOrder[]
  shop: string
}

export interface CustomersResponse {
  customers: CustomerRow[]
  nextPageInfo: string | null
  shop: string
}

export interface EditState {
  first_name: string
  last_name: string
  email: string
  phone: string
  address1: string
  city: string
  province: string
  zip: string
  country: string
  note: string
}
