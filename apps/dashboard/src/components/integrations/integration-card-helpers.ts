export type PillState =
  | 'connected'
  | 'not-connected'
  | 'action-needed'
  | 'auth-expiring'
  | 'waiting-for-inbound'
  | 'coming-soon'

export function formatLastActivity(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const FORWARDING_GUIDES = [
  {
    id: 'google',
    label: 'Google Workspace',
    steps: [
      'Gmail → Settings (gear) → See all settings → Forwarding and POP/IMAP.',
      'Click "Add a forwarding address" and paste the address above.',
      'Gmail sends a verification code to that address — it will appear as a new ticket in Clerk. Paste the code back into Gmail.',
      'Select "Forward a copy of incoming mail to…" and choose to keep Gmail\'s copy in the inbox.',
    ],
  },
  {
    id: 'outlook',
    label: 'Outlook 365',
    steps: [
      'Outlook on the web → Settings → Mail → Forwarding.',
      'Enable forwarding and paste the address above.',
      'Tick "Keep a copy of forwarded messages" so your archive stays intact.',
      'Save.',
    ],
  },
  {
    id: 'cpanel',
    label: 'cPanel',
    steps: [
      'cPanel → Email → Forwarders → Add Forwarder.',
      'Address to Forward: your support address (e.g. support@yourstore.com).',
      'Destination: Forward to email address — paste the address above.',
      'Add Forwarder.',
    ],
  },
  {
    id: 'cloudflare',
    label: 'Cloudflare',
    steps: [
      'Cloudflare Dashboard → your domain → Email → Email Routing → Destination addresses.',
      'Add the address above as a destination. Cloudflare sends a verification email — it will appear as a new ticket in Clerk. Click the link inside.',
      'Routes → create a custom address (e.g. support@yourdomain.com) routed to that destination.',
      'Save.',
    ],
  },
] as const

export type ForwardingProviderId = typeof FORWARDING_GUIDES[number]['id']
