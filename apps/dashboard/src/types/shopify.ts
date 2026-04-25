export interface ShopifyAddress {
  id?: number
  address1: string | null
  city: string | null
  province: string | null
  country_name: string | null
  zip: string | null
}

export interface ShopifyCustomer {
  id: number
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  note: string | null
  orders_count: number
  total_spent: string
  currency?: string | null
  created_at?: string
  default_address: ShopifyAddress | null
}

export interface ShopifyOrderLineItem {
  title: string
  quantity: number
  product_id?: number | null
  variant_title: string | null
  sku?: string | null
  image?: string | null
}

export interface ShopifyOrder {
  id: number
  name: string
  created_at: string
  fulfillment_status: string | null
  total_price: string
  currency?: string | null
  line_items: ShopifyOrderLineItem[]
}

export interface ShopifyData {
  customer: ShopifyCustomer | null
  orders: ShopifyOrder[]
  shop?: string
}

export interface ShopifyCustomerSearchResult {
  id: number
  first_name: string | null
  last_name: string | null
  email: string | null
}
