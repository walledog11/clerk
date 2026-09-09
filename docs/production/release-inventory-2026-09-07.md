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

## Continuation audit — 2026-09-07

- The exact verified application candidate is `7a3cd0b4`, the fifth local revision after
  `origin/master`. It is still absent from GitHub and production. Pushing `master` may trigger
  connected Vercel and Railway deploys, so the environment gate must be cleared first.
- A fresh metadata-only `vercel env ls production --json` again found `PRICE_ID` but no
  `PRICE_ID_STARTER` or `PRICE_ID_PRO`. No encrypted value was read.
- The locally authenticated Stripe CLI is in test mode. It lists two products named `Starter`
  with no prices and one active $39/month price attached to a product named `Clerk Pro`. The launch
  owner explicitly deferred Stripe price creation, mapping, and paid-checkout rollout for the near
  future. Do not use that unrelated $39 price or treat Stripe pricing as a current release task.
- The launch owner approved one release-mode eval invocation with a $0.75/100-call ceiling. On exact
  commit `c8a5b3c2`, all 45 dashboard fixtures reached before the dashboard allocation ended passed;
  the runner then stopped safely at $0.6247/94 calls, leaving three fixtures unexecuted. The separate
  gateway hard case passed within its $0.05/6-call allocation.
- A separately approved $0.05/6-call targeted completion ran only those three fixtures. The first two
  passed. The final fixture's in-flight response took measured spend to $0.0520 at 5/6 calls, after
  which the budget guard rejected the run and made no further call. This is the documented residual
  overshoot of one response, not an automatic rerun. The exact-commit cache now contains 47 passing
  dashboard results; `tier-watch-refund-draft-only` remains without an accepted result.
- The two budget stops exposed underestimation in preflight rather than a model-quality failure.
  A third, separately approved $0.03/3-call invocation then ran only
  `tier-watch-refund-draft-only`; it used all three calls and the guard stopped it before a fourth,
  leaving no accepted result. No retry was automatic. Release estimates now reserve 2.25 calls per
  dashboard fixture. Targeted estimates reserve the planner's 20-call mechanical bound (two possible
  10-iteration attempts), plus separate execution and judge bounds when a fixture uses them, and use
  the greater of two-times baseline cost or an observed cold-start floor plus 20% contingency.
  Regression tests prove that all three exhausted ceilings are rejected before provider calls.
- The launch owner approved one final targeted invocation for `tier-watch-refund-draft-only` with a
  $0.10/20-call ceiling. On exact commit `c8a5b3c2`, it passed 1/1 in five planner calls, spending
  $0.0460; no judge or execution call was needed, and no retry ran. This supplies passing behavior
  evidence for all 48 dashboard core fixtures on the exact candidate, while the gateway hard case
  also passed. The original release-mode invocation remains a budget failure under the strict
  single-invocation release semantics, so the A4 release-gate item stays open and no further paid run
  is planned. The isolated result also raised targeted preflight's dollar estimate to $0.0552/20 calls.
- GitHub CLI authentication for `walledog11` is valid in the host keychain with `repo` and `workflow`
  scopes. Sandboxed checks without keychain access can still report the old invalid credential.
- Anthropic's current Sonnet 5 page says the introductory $2/MTok input and $10/MTok output price
  was made permanent. Production spend accounting still carried the earlier September 1
  reversion assumption and charged $3/$15, while the paid-eval path already used $2/$10. The
  production table now uses the current price, both tables are dated 2026-09-07, and a root test
  enforces production/eval parity for all priced models. Both accounting paths reject unknown
  models instead of silently applying a fallback. Targeted agent tests, the gateway spend
  integration test, both package typechecks, and the node budget/parity tests pass.
- The exact `7a3cd0b4` candidate passes the complete no-cost canonical gate in one run: static
  checks; all workspace unit suites and 69 node tests; 12 smoke E2E tests; the coverage/integration
  matrix and every critical coverage threshold; and all seven production builds. The run used local
  process/socket access required by PostgreSQL and Turbopack workers.
- A focused local A2 recovery rehearsal passed 86 tests across the gateway and agent. The selected
  cases persist recovery state before a failed queue admission, recover both by provider redelivery
  and by the database sweep, deduplicate inbound/provider retries, stop later mutations after lease
  loss, refuse a mutation whose action attempt cannot be journaled, and reconcile ambiguous Shopify
  order creation by its persisted operation key without blindly issuing another create. Outcomes
  that cannot be confirmed remain `unknown`. This closes the local failure-boundary rehearsal; it
  does not replace post-deployment isolated acceptance checks.

## A2 release and isolated acceptance — 2026-09-08

- Released immutable candidate `e4cfab72bf86f427f3ffeead03a74c73c04341a2` from `master` to
  `origin/master`. GitHub CI run `34188474960` passed secret scan, static verification and audit,
  unit tests, integration and coverage, all builds, and browser E2E. Deterministic eval preflight run
  `34188475112` also passed. A fresh local `npm run verify:pr` passed on the same revision, including
  1,644 integration tests with three optional/live cases skipped and 12 browser smoke tests.
- Production now runs the candidate on Vercel dashboard deployment
  `dpl_J9Ryu7DCwhPE1H6R5mtnr4UoAS1p`, Railway gateway deployment
  `d190c355-c2cb-4864-841b-a89fd049231d`, and Railway worker deployment
  `1dbaff8f-8cb8-4843-b938-cfa0e14f3cf5`. The dashboard is `READY`; both Railway deployments are
  `SUCCESS`. The production database still reports all 82 migrations applied with none pending.
- Both Railway roles passed the boot environment contract. The intentionally deferred Stripe
  Starter/Pro price mapping remains outside this engineering release, so this evidence does not
  claim that paid checkout or broad launch is ready. Those business/provider gates remain open in
  A3 and B1.
- Isolated acceptance exposed a heartbeat-default mismatch: the production worker emitted every
  five minutes while the gateway, which lacked `NODE_ENV`, initially judged the heartbeat stale
  after one minute. Both services now have explicit 300,000 ms interval, 900 second TTL, and
  600,000 ms stale settings. A temporary gateway `NODE_ENV=production` change was removed after it
  caused Railway's install step to omit build-time type packages; failed deployment
  `cfde2776-33bf-4dd1-9a41-3d73f25b370e` was never promoted. The corrected gateway build above
  installed the build dependencies, started cleanly, and reports a healthy worker.
- Authenticated queue diagnostics found 32 retained historical failures. Before housekeeping, the
  evidence was reconciled against durable state: 27 summary failures belonged to three deleted
  threads or a surviving thread with newer cached-plan and episode-outcome records; three
  order-review failures were synthetic `999999xxx` probes; one disconnect was superseded by the
  integration's later active state; and one Gmail failure remains durably marked
  `reauthorization_required` with later sync attempts recorded. With explicit owner approval, only
  those exact failed BullMQ records were removed through the authenticated endpoint, which
  rechecked each job was still failed. The Redis records are not recoverable; PostgreSQL evidence
  was not deleted.
- Post-housekeeping diagnostics returned `200`, a healthy worker, and zero waiting, active, or
  failed jobs across every monitored queue. The sole delayed job is the expected repeating Gmail
  watch-maintenance schedule. `npm run verify:production` then passed dashboard deep health,
  dashboard-to-gateway authentication boundaries, gateway database/Redis/worker/queue readiness,
  iMessage configuration, and Photon webhook reachability. The optional inbound-email smoke was
  skipped because no fixture address was supplied; real provider-channel acceptance remains A3.
- The read-only 24-hour strict unknown-outcome and operator-event audits both passed with no unknown
  outcomes, stale claims, failed events, stuck events, or undelivered committed replies. Combined
  with the 86-test failure-boundary rehearsal above, this closes A2. It does not close the remaining
  provider, pricing, paid-evaluation, alert-routing, monitor, PITR, or real-merchant launch gates.
