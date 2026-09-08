# SocialAPI.ai as an Instagram integration pivot

Decision memo for Shopkeeper · September 7, 2026

## Recommendation

**Use SocialAPI.ai as a reversible launch bridge, not as an irreversible replacement for the direct Meta integration.**

SocialAPI appears to solve the immediate blocker: it supplies its own approved Meta app, so external merchants can connect without Shopkeeper first obtaining Advanced Access. Its API covers Instagram DMs, signed webhooks, replies, token management, and account routing. That can be worth using if Meta review is delaying real merchant validation.

A complete cutover is not yet the smart move. Shopkeeper's direct Instagram path is already implemented, Standard Access-tested, and operationally hardened. Replacing it would trade one remaining approval gate for dependence on a new, founder-operated vendor, a shared Meta app, third-party handling of merchant tokens and customer DMs, non-Shopkeeper OAuth branding, and a difficult exit that would likely make merchants reconnect.

The practical decision is therefore:

- **Yes** to a small, organization-gated SocialAPI pilot now.
- **No** to deleting, pausing, or structurally replacing direct Meta now.
- **Continue Meta Advanced Access in parallel** so Shopkeeper preserves control and an exit path.

## Why SocialAPI is attractive

SocialAPI says its pre-approved Instagram app supplies OAuth and manages tokens, with no Meta App Review required by its customer. End users still authorize their Professional Instagram account, but through SocialAPI's app. Today, that consent screen shows SocialAPI's brand; white-label consent and bring-your-own Meta app are only roadmap items. [SocialAPI platform credentials](https://docs.social-api.ai/guides/platform-credentials)

The core API fit is good:

- Instagram DMs can arrive through `dm.received` webhooks and be read/replied to through conversation APIs. Meta's 24-hour response rule still applies. [Unified inbox](https://docs.social-api.ai/guides/inbox)
- Webhooks are HMAC-signed, retried five times, logged, and manually replayable; the docs explicitly require idempotency. [Webhook documentation](https://docs.social-api.ai/guides/webhooks)
- Connected accounts are grouped into per-merchant brands and assigned stable account IDs. [Core concepts](https://docs.social-api.ai/guides/concepts)
- Published monthly pricing is $29 for 10 brands, $109 for 50, and $349 for 200; the free tier supports two. Paid tiers advertise unlimited writes subject to platform limits and fair use. [Plans and limits](https://docs.social-api.ai/guides/rate-limits)

For a launch bridge, that price is small compared with weeks of blocked merchant learning.

## What it does not solve

SocialAPI delegates Meta's approval and maintenance burden; it does not eliminate Meta. Instagram still requires a Professional account, a user-initiated conversation, and compliance with messaging limits. Meta's own current documentation confirms those prerequisites and the limits on group messaging and old request-folder conversations. [Meta's official Instagram API collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)

The shared app is also a shared failure domain. SocialAPI itself states that a platform-app revocation or rate limit affects all customers on that platform. That is materially different from Shopkeeper controlling its own Meta app. [SocialAPI platform credentials](https://docs.social-api.ai/guides/platform-credentials)

The broad “11 platforms” positioning should not drive this decision. The vendor's own capability matrix shows that inbox/DM coverage varies substantially—DMs are currently useful mainly for Instagram and Facebook, while TikTok, LinkedIn, Threads, Google, and YouTube do not expose DMs through this API. [Platform support](https://docs.social-api.ai/guides/platforms)

## Risks that need resolution

### 1. Maturity and concentration risk

The service is built and operated end-to-end by one founder, according to its own site. Its [GitHub organization](https://github.com/SocialAPI-AI) is small, and the available [Trustpilot profile](https://www.trustpilot.com/review/social-api.ai) has only two reviews. That is not evidence of a bad product; it means public evidence is too thin to establish production reliability, support depth, or business continuity.

The public status page has a short history and records a roughly two-hour Facebook/message-processing degradation on July 19, 2026. Its terms promise 99.9% paid-plan API uptime but exclude platform outages, and allow the vendor to terminate service with 30 days' notice for any reason. [Status history](https://status.social-api.ai/events) · [Terms of Service](https://social-api.ai/terms)

### 2. Conflicting data-retention claims

This is the largest diligence red flag. The February terms and current inbox documentation say interaction content is not persistently stored and may only be cached for five minutes. The newer August privacy policy says posts, comments, and DMs are stored for the duration of the customer's account, webhook delivery logs are retained for that duration, and media can remain for 60 days. [Terms of Service](https://social-api.ai/terms) · [Privacy Policy](https://social-api.ai/privacy) · [Unified inbox](https://docs.social-api.ai/guides/inbox)

Treat the newer privacy policy as the conservative truth until the vendor reconciles this in writing and supplies a DPA. The policy lists encryption, EU hosting, named subprocessors, and no AI training, which are positive, but I found no public SOC 2/ISO 27001 certificate or independent penetration-test evidence.

### 3. Multi-tenant credential blast radius

The documented API key lists every connected account in its workspace, while the MCP OAuth surface currently exposes only a broad `social:all` scope. Confirm whether Shopkeeper can obtain per-brand, least-privilege service credentials. A single master credential spanning all merchants is a larger incident radius than the present per-integration Meta tokens. [Account API](https://docs.social-api.ai/api-reference/accounts/list-connected-accounts) · [OAuth documentation](https://docs.social-api.ai/guides/oauth)

### 4. Required attachment behavior is not proven

Shopkeeper's acceptance contract includes private attachment persistence and image understanding. SocialAPI documents a `content.media` array, but the public DM/webhook material does not establish full behavior for images, video, audio, story/post shares, deleted messages, unsupported messages, URL expiry, or catch-up after missed webhooks. [Instagram connector](https://docs.social-api.ai/connectors/instagram) · [Webhook documentation](https://docs.social-api.ai/guides/webhooks)

This gap is a reason to pilot, not a reason to assume parity.

## Repository-specific impact

This is not a one-file client replacement. The current path includes:

- direct Instagram OAuth, scope/account validation, long-lived-token exchange, subscription verification, and rollback in [complete-instagram-oauth.ts](../../apps/dashboard/src/app/api/integrations/instagram/callback/complete-instagram-oauth.ts);
- signed webhook normalization, exact-account ownership resolution, attachment handling, and durable queueing in [webhooks-meta.ts](../../apps/gateway/src/routes/webhooks-meta.ts);
- reply-window enforcement, outbound recording, provider error mapping, and exact-account dispatch in [instagram-dispatch.ts](../../apps/dashboard/src/lib/messaging/instagram-dispatch.ts);
- provider token/subscription monitoring in [token-health.ts](../../apps/gateway/src/maintenance/token-health.ts);
- rollout and live acceptance requirements in the [production runbook](../production/runbook.md) and [to-do list](../to-do-list.md).

The repository says the full Standard Access lifecycle already passed; the remaining external-launch gate is Advanced Access plus a non-role merchant pass. That makes a wholesale rewrite lower-value than it would be for a greenfield product.

## Recommended architecture and pilot

Keep `ig_dm` as the product channel and introduce a provider boundary underneath it:

```text
Merchant Instagram
       │
       ├── Meta direct ─────┐
       │                    ├── normalized Instagram inbound job → existing agent/ticket flow
       └── SocialAPI bridge ┘

Existing reply workflow → selected provider transport → Instagram
```

Use `meta_direct | socialapi` in integration metadata, add a separate signed SocialAPI webhook route, and preserve the existing normalized job and reply workflow. Gate SocialAPI by organization so rollback is a configuration change rather than another migration.

A reasonable engineering estimate from the current surface is 2–4 days for a bounded adapter spike, then 1–2 weeks for production hardening, test/runbook updates, and a meaningful live pilot. The pilot—not the code compile—is the decision gate.

Run two non-role Professional accounts for 7–14 days and require:

1. Connect, inbound text, inbound image/share, reply, disconnect, reconnect.
2. Rapid messages, retries, duplicates, out-of-order delivery, stable IDs, and original provider timestamps.
3. Image/video/audio/share/deleted/unsupported event coverage and private media capture before URLs expire.
4. Correct 24-hour-window behavior and useful provider errors.
5. Token revocation/reconnect, webhook replay, and polling/backfill after an outage.
6. Verified account-to-Shopkeeper-organization isolation.
7. Verified deletion behavior and an acceptable captured consent screen.

## Questions to send SocialAPI before production

1. Which retention statement is correct? List every DM/comment/webhook field stored, storage location, and exact retention/deletion timing.
2. Provide the DPA, last penetration-test summary, breach history, RTO/RPO, backup/restore design, and subprocessor-change terms.
3. Can API credentials be scoped to one brand and read/write capabilities?
4. Provide real Instagram webhook examples for images, video, audio, story/post shares, deleted/unsent, and unsupported messages, including URL lifetime.
5. How are missed webhooks backfilled, and which events cannot be recovered?
6. What shared Meta-app limits apply, how are tenants isolated, and what happens during Meta restriction or annual Data Use Checkup?
7. When will dedicated/BYOA Meta apps and white-label OAuth be available?
8. What is export and reconnection behavior on termination? Must every merchant reauthorize elsewhere?
9. Does the SLA cover webhook delivery and message processing, and what response targets apply below Enterprise?
10. Confirm that one Shopkeeper merchant with one account per network consumes one billable brand, plus the exact fair-use thresholds.

## Bottom line

SocialAPI is a smart **tactical pivot for speed-to-learning**, provided Shopkeeper builds it as a removable transport and validates it against the existing Instagram acceptance contract. It is not yet a smart **strategic replacement** for a nearly finished direct integration.

The trigger to reconsider that conclusion would be strong pilot performance plus satisfactory DPA/security/retention answers—especially if Shopkeeper decides to support several customer-origin social networks soon. Until then, the best risk-adjusted posture is dual-track: use SocialAPI to unblock selected merchants while finishing Meta approval.

## Research limits

No authenticated SocialAPI account, live OAuth flow, or production API call was used. Independent evidence is sparse, so most capability claims are first-party and should be treated as hypotheses until the pilot. Legal and privacy observations are diligence flags, not legal advice.
