const SHOPIFY_SHOP_DOMAIN_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export function normalizeShopifyShopDomain(shop: string | null | undefined): string | null {
  const normalized = shop?.trim().toLowerCase();
  if (!normalized) return null;

  const shopDomain = normalized.includes('.') ? normalized : `${normalized}.myshopify.com`;
  return SHOPIFY_SHOP_DOMAIN_RE.test(shopDomain) ? shopDomain : null;
}
