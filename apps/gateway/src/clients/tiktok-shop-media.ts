import { downloadProviderMedia, isAllowedProviderMediaUrl } from './provider-media.js';


const TIKTOK_MEDIA_HOST_SUFFIXES = [
  'byteimg.com',
  'ibyteimg.com',
  'muscdn.com',
  'tiktok.com',
  'tiktokcdn.com',
  'tiktokshop.com',
  'ttwstatic.com',
] as const;

const IMAGE_CONTENT_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface DownloadedTikTokShopImage {
  filename: string;
  contentType: string;
  base64Content: string;
}

export function isAllowedTikTokShopMediaUrl(value: string): boolean {
  return isAllowedProviderMediaUrl(value, TIKTOK_MEDIA_HOST_SUFFIXES);
}

export async function downloadTikTokShopImage(url: string, signal?: AbortSignal, consumeBytes?: (bytes: number) => boolean): Promise<DownloadedTikTokShopImage | null> {
  return downloadProviderMedia(url, {
    allowedUrl: isAllowedTikTokShopMediaUrl,
    allowedContentTypes: IMAGE_CONTENT_TYPES,
    filename: contentType => `tiktok-image.${CONTENT_TYPE_EXTENSIONS[contentType]}`,
    signal,
    consumeBytes,
  });
}
