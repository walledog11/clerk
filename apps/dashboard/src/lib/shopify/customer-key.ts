interface ShopifyCustomerKeyInput {
  channelType?: string | null
  customerPlatformId?: string | null
  shopifyCustomerId?: string | null
  orderLimit?: number
}

export function buildShopifyCustomerKey({
  channelType,
  customerPlatformId,
  shopifyCustomerId,
  orderLimit,
}: ShopifyCustomerKeyInput) {
  const params = new URLSearchParams()

  if (shopifyCustomerId) {
    params.set('customerId', shopifyCustomerId)
  } else if (channelType === 'email' && customerPlatformId) {
    params.set('email', customerPlatformId)
  } else {
    return null
  }

  if (orderLimit !== undefined) {
    params.set('orderLimit', String(orderLimit))
  }

  return `/api/shopify/customer?${params.toString()}`
}
