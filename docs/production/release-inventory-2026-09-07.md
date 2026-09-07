# Release inventory — 2026-09-07

Observed at 2026-09-07T19:45:40Z for improvement-plan item A2. This is deployment evidence, not a production-readiness sign-off.

## Source candidate

- Branch: `master`
- Base revision: `9f05d671a1f21dd8ccdf06853e0a3b71672c08b7`
- Base revision matches `origin/master` at the time of inventory.
- The candidate is not yet an immutable revision. It consists of the base revision plus a dirty working tree containing the agent/channel audit work and the A1 inbox fix.
- Working tree at inventory: 51 tracked files changed or deleted and 8 untracked paths. The tracked diff contains 833 additions and 650 deletions.
- The generated Prisma client contains `Message.inboundProcessingPending`, `Message.inboundProcessingData`, and `Message.inboundProcessingAttemptedAt`, matching the current schema.

## Production applications

| Surface | Deployment record | State | Source revision |
| --- | --- | --- | --- |
| Vercel dashboard | `dpl_C4sZgmukLFyJVDdn5oHpaCG63cMN` | READY | `9f05d671a1f21dd8ccdf06853e0a3b71672c08b7` |
| Railway `shopkeeper` gateway | `25ecc477-e7df-492d-b1af-86fb684433db` | SUCCESS | `9f05d671a1f21dd8ccdf06853e0a3b71672c08b7` |
| Railway `Gateway Worker` | `1409692a-7eff-4d74-bf40-dda604b3e17b` | SUCCESS | `9f05d671a1f21dd8ccdf06853e0a3b71672c08b7` |

All three application surfaces run the base revision. None contains the dirty agent/channel audit work or A1 inbox fix.

## Database and Shopify

- A production `prisma migrate status` check reported all 82 repository migrations applied and the schema up to date.
- The additive outbox migration is `20260906120000_inbound_processing_outbox`.
- Active Shopify app configuration: `shopkeeper-production-29`, version ID `gid://shopify/Version/1107846889473`, created 2026-08-29T04:40:25.

## Candidate boundary

The production database is compatible with both the deployed base revision and the local candidate because the outbox migration is additive. The next release candidate must first turn the dirty working tree into a reviewable revision, pass the canonical checks, and deploy matching dashboard and gateway/worker builds before live recovery canaries are run.

## Candidate review — 2026-09-07T20:04:01Z

- Reviewed the dirty implementation against all twelve findings in
  [Agent and channel audit fixes](../code-audit-fixes.md), including failure boundaries for
  persisted-but-not-enqueued messages, unknown provider outcomes, lease loss between mutations,
  and pre-mutation action journaling. No release-blocking defect was found.
- Fresh Railway and Vercel deployment reads still report `9f05d671a1f21dd8ccdf06853e0a3b71672c08b7`
  for the dashboard, gateway, and Gateway Worker. The candidate remains local and undeployed.
- A fresh production `prisma migrate status` through the Railway production environment reports
  all 82 repository migrations applied and the database schema up to date.
- `npm run verify:pr` passed on the unchanged candidate tree: static checks, unit and node tests,
  12 smoke E2E tests, the full coverage/integration matrix, critical coverage thresholds, and all
  seven production builds. The first sandboxed attempt reached E2E and failed only because the
  sandbox denied the local PostgreSQL socket; the required rerun with local process/socket access
  passed.
- The reviewed code is now captured in two local implementation revisions: `3f9d82ce` for the A1
  inbox fix and `7dcf7029` for the agent/channel reliability batch. Neither revision has been pushed
  or deployed.

The verification is attached to the combined code tree ending at `7dcf7029`. Documentation-only
evidence changes made afterward do not invalidate the application checks. Rerun the affected gate
if application code changes before deployment.

## Pre-deployment gate and environment review — 2026-09-07T22:09:11Z

- The standalone integration gate passed before the A4 work: 1,642 tests passed across agent,
  gateway, and dashboard; three live/optional cases were skipped by design.
- The Railway production gateway environment passes its launch contract. It still reports the
  existing warning that `REDIS_URL` is not configured with `rediss://` TLS.
- A metadata-only Vercel production environment inventory found the legacy `PRICE_ID`, but not
  the required `PRICE_ID_STARTER` and `PRICE_ID_PRO` names. No secret values were downloaded.
  The dashboard launch contract requires both names, so push/deployment remains paused until the
  Stripe price mapping is deliberately provisioned; inventing those business identifiers would
  be unsafe.
- The application tree changed after the earlier `7dcf7029` verification to implement A4
  completion facts and pre-send outcome grounding. `npm run verify:pr` was rerun on that tree and
  passed static checks, all workspace unit suites, node tests, 12 smoke E2E tests, the full
  coverage/integration matrix and critical thresholds, and all seven production builds.
- The paid model-evaluation step has not run. The repository requires an explicit dollar and
  model-call ceiling for it; deterministic completion-grounding regressions and the no-cost
  release gate are complete.
