# SocialAPI controlled-spike evidence — 2026-09-09

Status: partial. Account inventory, controlled text/image discovery, provider-accepted text reply,
participant receipt, webhook endpoint registration, and signed `dm.received` delivery passed.
Milestone-zero ingress and outbound through the durable workflow are implemented and
deterministically covered but not yet deployed or exercised against a live DM. Outbound `dm.sent` correlation, reconnect, and
disconnect remain open. Image coverage and send-result correlation have unresolved provider gaps.

## Scope and handling

The probe used the connected SocialAPI brand and Instagram account supplied through the ignored
`.env.socialapi.local` file. At the initial inventory, a separate sender/test participant had not
yet been designated; the fresh exchange below occurred only after one was explicitly designated. No
credential, raw identifier, participant detail, message text, or media URL is recorded here. Stable
SHA-256 prefixes were used only to compare identifier equality inside the transient probe output.

## Dated observations

- The scoped key could list the assigned brand's accounts.
- Exactly one Instagram account was returned. Its brand matched the assigned brand, status was
  `active`, and no reconnect reason was present.
- The account returned three active conversations in one bounded page.
- The newest conversation returned 25 messages and reported another page. The probe did not follow
  the cursor; this establishes that recovery reads are paginated rather than complete by default.
- The conversation's SocialAPI `id` differed from its `platform_id`.
- Each inspected message's SocialAPI `id` differed from its `platform_id`.
- Every inspected incoming message had the same `sender_id` as the conversation's
  `participant_id`. This demonstrates agreement between SocialAPI's two normalized read surfaces
  for that historical sample. Because the participant was not pre-designated as a controlled test
  identity, this is not acceptance evidence and does **not** prove equality with direct Meta's
  `Customer.platformId`.
- The inspected sample contained text and image messages. Image rows exposed an attachment type and
  URL structurally; URL lifetime, download authorization, deletion, and private persistence remain
  untested.
- After a separate Instagram account was explicitly designated as the controlled participant, a
  fresh text and image appeared as the two newest incoming rows in the same conversation. Their
  sender IDs matched that conversation's participant ID, and the image row carried both text and
  an image attachment structurally. The exact text semantics of image-only messages still need a
  sanitized fixture.
- A guarded send within the fresh response window returned success with one message ID. A bounded
  read immediately afterward showed a new outgoing text row at the expected time.
- The controlled participant confirmed receipt of the marked reply on 2026-09-09.
- Gateway commit `c3b8a79e` deployed successfully to the Railway web service. Its deep health check
  reported database, Redis, worker heartbeat, queues, and iMessage healthy.
- SocialAPI registered one active endpoint for `dm.received` and `dm.sent`; its identifier
  fingerprint is `sha256:9f0912cd02ee2e48`. The one-time endpoint secret was installed directly in
  Railway without printing or committing it. After the secret redeploy, the formerly available
  unsigned registration shape returned `401`, confirming that the exception closed.
- A provider-generated synthetic test passed V2 authentication but was rejected with `400` because
  its event header did not match its structurally inspected `{event,data}` body. Do not weaken the
  header/body check for this synthetic discrepancy. Real deliveries subsequently passed; ask the
  vendor about the synthetic test-delivery header separately.
- A second fresh controlled text/image pair generated two real `dm.received` deliveries. Both passed
  V2 verification, carried distinct delivery IDs, reached the gateway once, and received `200` in
  5–6 ms. SocialAPI's delivery records classify both as `delivered` with one attempt.
- For both real deliveries, webhook `data.account_id` matched the bounded conversation's account,
  `data.conversation_id` matched the inbox conversation ID, and webhook `data.author.id` plus raw
  `sender.id` matched the inbox conversation participant and message sender.
- For both real deliveries, webhook `data.platform_id` and raw `message.mid` matched the stored
  inbox row's `platform_id`. This is the canonical webhook-plus-poll deduplication join observed in
  the spike.
- Webhook `data.id` did **not** match either the stored inbox row's SocialAPI `id` or its
  `platform_id`. Treat the interaction ID as a separate provider identifier; do not use it alone to
  deduplicate webhook delivery against inbox recovery reads.
- The fresh text event contained text and no media, as expected. The fresh image event contained no
  text and one `ephemeral` media item with no URL in both the webhook and stored inbox row. This is a
  blocking attachment-coverage finding: Shopkeeper cannot privately persist or inspect that image
  from the observed payload. An earlier non-ephemeral image row did expose an image URL, so image
  behavior varies by Instagram send mode and must be classified rather than treated as one shape.
- The send-result message ID fingerprint matched neither the outgoing inbox row's SocialAPI `id`
  nor its `platform_id`. Do not use the current send result as proven correlation or completion
  evidence. Obtain the signed `dm.sent` payload and ask the vendor which identifier joins the send
  response, webhook echo, and inbox read surfaces.

## Next evidence

1. Send one controlled reply and capture its signed `dm.sent` event. Compare the send-response ID,
   webhook interaction/native IDs, and outgoing inbox row rather than inferring success by recency.
2. Ask SocialAPI how `ephemeral` Instagram attachments are intended to be handled and test an
   ordinary gallery image separately from a disappearing or view-once image.
3. Compare the now-proven SocialAPI author/native sender ID with the direct-Meta sender ID for the
   same controlled participant; SocialAPI-internal sender agreement is proven, cross-app equality
   is not.
4. Exercise a controlled webhook retry and bounded recovery read using the native `platform_id` as
   the candidate canonical message key; confirm one durable result once application ingress exists.
5. Route the controlled message through Shopkeeper ticket creation, planning, approval, and a
   received reply while the 24-hour window is open.
6. Exercise disconnect/reconnect only after the account and recovery target are explicitly
   confirmed.

No go/no-go decision is justified by this partial controlled-spike evidence.

## Milestone-zero ingress slice — landed 2026-09-09

The receiver is no longer observation-only. What changed, and what it does not yet do:

- A verified `dm.received` whose `data.account_id` matches `SOCIALAPI_PINNED_ACCOUNT_ID` is
  normalized and added to the existing inbound BullMQ queue as an Instagram job carrying
  `provider: 'socialapi'`. Enqueue happens before the `200`; a queue failure returns `500` so the
  vendor's retry is the recovery path.
- The job's `externalMessageId` is the native `platform_id` (raw `message.mid` fallback) — the join
  this spike proved. The provider interaction `id`, which matched neither inbox identifier, is
  never used for deduplication.
- `senderIgsid` carries SocialAPI's author id. Transport-plan invariant 6 expects this to differ
  from a direct-Meta IGSID because each transport observes the shopper through a different Meta
  app, so it becomes `Customer.platformId` for SocialAPI threads and is not interchangeable with a
  direct row's identity. Nothing migrates between them.
- The worker branches on transport. A SocialAPI job skips Meta profile enrichment and Meta media
  download, both of which need a Meta token the row does not hold, so a SocialAPI customer has no
  display name yet and media renders through `formatInstagramMessage` as
  `[Instagram <type> attachment]`. The `ephemeral` image this spike could not fetch therefore
  reaches the merchant as a visible marker rather than being silently dropped.
- Routing is one pinned account, not account lookup: `SOCIALAPI_PINNED_ACCOUNT_ID` plus
  `SOCIALAPI_PINNED_INTEGRATION_ID`, with `npm run spike:socialapi -- pin --execute` creating or
  re-pointing the `ig_dm` row. With either variable unset the route stays observation-only. S1
  replaces this with the indexed `providerAccountId` column.
- The thread stores the webhook's `conversation_id` in `Thread.externalSpaceId`, and an approved
  reply for a SocialAPI thread leaves through SocialAPI's conversation endpoint with the workspace
  `SOCIALAPI_API_KEY`. It shares the 24-hour window check, reply-integration routing, and outbound
  recording with the direct Meta path, skips the Meta health/permission/token gates, and is never
  retried through Meta. Send failures alert as `provider=socialapi`, so a SocialAPI outage cannot
  read as a Meta outage.
- Still absent: OAuth, `dm.sent` reconciliation, recovery and catch-up reads, health probing,
  reconnect, disconnect, deletion, capacity controls, and per-transport observability.

Deterministic coverage: 14 route tests (pinned enqueue, native-id keying, raw fallbacks, media
pass-through, unpinned and `dm.sent` no-ops, missing pinned row, queue-failure `500`), 4 normalizer
tests, 3 worker integration tests against a real database (persistence without a Meta call,
unfetchable media rendered rather than dropped, and a SocialAPI job refused against a direct Meta
row), and 4 dispatch integration tests (provider send rather than Graph, refusal without a
conversation id, refusal without an API key, and no Meta retry on failure). Full unit, integration,
node-script, typecheck, lint, knip, and doc-reference checks pass.

The dashboard integration suite went red once during this work and passed on two immediate reruns
with no code change, matching the known workspace-concurrency flake rather than anything here.

## Locally verified receiver slice

The gateway now has a spike-only `POST /webhooks/socialapi` route. While no endpoint secret is
configured, it accepts only a rate-limited, small `webhook.test` registration shape and performs no
queue or persistence work. Once `SOCIALAPI_WEBHOOK_SECRET` is configured, every event—including
test deliveries—must pass the replay-bounded V2 signature check; real events must also carry a
delivery ID. Its observation log contains only event structure, counts, timestamps, and SHA-256
identifier prefixes. It deliberately does not create Shopkeeper jobs yet.

Focused route tests cover the registration gate, unsigned rejection, V2 acceptance, stale
signatures, event mismatch, required real-delivery IDs, content-free logging, and the signed-webhook
body limit. The route tests, gateway typecheck/lint/build, and integrations build passed locally on
2026-09-09. Commit `c3b8a79e` is deployed and its endpoint is registered. Two real signed
`dm.received` deliveries passed against that observation-only build; the ingress slice recorded
above supersedes the no-work behavior and is not yet deployed or live-verified.
