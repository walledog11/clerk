# SocialAPI controlled-spike evidence — 2026-09-09

Status: partial. Account inventory, fresh controlled text/image discovery, provider-accepted text
reply, and participant receipt passed. Webhook verification, Shopkeeper persistence/approval,
reconnect, and disconnect remain open. Send-result correlation has an unresolved provider ID gap.

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
- The send-result message ID fingerprint matched neither the outgoing inbox row's SocialAPI `id`
  nor its `platform_id`. Do not use the current send result as proven correlation or completion
  evidence. Obtain the signed `dm.sent` payload and ask the vendor which identifier joins the send
  response, webhook echo, and inbox read surfaces.

## Next evidence

1. Capture signed `dm.received` and `dm.sent` deliveries for a fresh controlled exchange using the
   locally verified spike receiver. Deploy and register it first; the existing exchange occurred
   before any webhook endpoint existed.
2. Compare the live webhook author/native sender ID, the inbox `participant_id`/`sender_id`, and the
   direct-Meta sender ID for that same participant.
3. Prove webhook delivery ID, SocialAPI interaction ID, stored-message ID, and native platform ID
   converge under retry and recovery reads.
4. Route the controlled message through Shopkeeper ticket creation, planning, approval, and a
   received reply while the 24-hour window is open.
5. Exercise disconnect/reconnect only after the account and recovery target are explicitly
   confirmed.

No go/no-go decision is justified by this partial controlled-spike evidence.

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
2026-09-09. The route is not deployed and no SocialAPI endpoint has been registered.
