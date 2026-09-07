import { downloadProviderMedia, isAllowedProviderMediaUrl } from './provider-media.js';
import type { InstagramInboundAttachment } from '../types.js';


const META_MEDIA_HOST_SUFFIXES = [
  'cdninstagram.com',
  'facebook.com',
  'facebook.net',
  'fbcdn.net',
  'fbsbx.com',
  'instagram.com',
] as const;

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  'application/octet-stream': 'bin',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'audio/aac': 'aac',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-m4a': 'm4a',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'text/plain': 'txt',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

const ALLOWED_CONTENT_TYPES_BY_ATTACHMENT: Record<string, ReadonlySet<string>> = {
  audio: new Set(Object.keys(CONTENT_TYPE_EXTENSIONS).filter((type) => type.startsWith('audio/'))),
  file: new Set(Object.keys(CONTENT_TYPE_EXTENSIONS)),
  image: new Set(Object.keys(CONTENT_TYPE_EXTENSIONS).filter((type) => type.startsWith('image/'))),
  media: new Set(Object.keys(CONTENT_TYPE_EXTENSIONS)),
  video: new Set(Object.keys(CONTENT_TYPE_EXTENSIONS).filter((type) => type.startsWith('video/'))),
};

export interface DownloadedInstagramAttachment {
  filename: string;
  contentType: string;
  base64Content: string;
}

export function isSupportedInstagramBinaryAttachment(type: string): boolean {
  return Object.hasOwn(ALLOWED_CONTENT_TYPES_BY_ATTACHMENT, type.toLowerCase());
}

export function isAllowedInstagramMediaUrl(value: string): boolean {
  return isAllowedProviderMediaUrl(value, META_MEDIA_HOST_SUFFIXES);
}

export async function downloadInstagramAttachment(
  attachment: InstagramInboundAttachment,
  signal?: AbortSignal,
  consumeBytes?: (bytes: number) => boolean,
): Promise<DownloadedInstagramAttachment | null> {
  const type = attachment.type.toLowerCase();
  const allowed = ALLOWED_CONTENT_TYPES_BY_ATTACHMENT[type];
  if (!allowed || !attachment.url) return null;
  return downloadProviderMedia(attachment.url, {
    allowedUrl: isAllowedInstagramMediaUrl,
    allowedContentTypes: allowed,
    filename: contentType => `instagram-${type}.${CONTENT_TYPE_EXTENSIONS[contentType]}`,
    signal,
    consumeBytes,
  });
}
