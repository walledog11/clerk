# Agent and channel audit fixes

Implemented September 6, 2026. The changes address the twelve findings from the agent/channel audit.

| Finding | Change | Expected improvement |
| --- | --- | --- |
| Operator settings omitted | Load workspace settings before free-form operator execution. | Configured permissions, cancellation rules, refund limits, spending limits, and voice reach the runtime. |
| Lost leases ignored | Carry an ownership guard on the context and check it at model/tool boundaries, including between mutations. | Stop subsequent actions after lease loss. Already-issued requests still require outcome reconciliation. |
| Unknown delivery downgraded | Preserve `unknown` through email queue admission, TikTok dispatch, internal HTTP errors, operator ticket-reply tools, and failure summaries. | Uncertain delivery is not treated as safely retryable. |
| Partial runs lose action history | Persist an unknown attempt before mutative tools, update the result afterward, and finalize partial history/usage on exceptions. | Completed actions survive later model failure; interrupted attempts remain available for reconciliation. Reads retain batch persistence. |
| Message commit/enqueue gap | Store follow-up work on the message in its creation transaction; clear it after delivery. Retry on duplicate ingestion and through a minute-level recovery worker. | Accepted messages retain recoverable work through queue outages and process interruption. |
| Recovery starvation | Page through candidates by stable ID instead of inspecting only the first 100. | Approval-owned threads cannot hide later recoverable work. |
| Integration lifecycle inconsistency | Exclude inactive Shopify integrations from context; bind new TikTok jobs to integration IDs and revalidate on processing. Legacy TikTok jobs also require an active matching integration. | Disconnected or replaced connections are not silently used by these paths. |
| KB relevance applied after limit | Rank case-insensitive tag matches before selecting three articles; preserve memory overrides and context budgets. | Older relevant policies remain available without loading every article body. |
| TikTok batch loss | Normalize all supported batch events, inherit envelope account identity, and enqueue messages individually with stable job IDs. | Every valid buyer message in a batch reaches ingestion. |
| Duplicate enrichment | Check persisted provider IDs before enrichment; cache Instagram profiles for ten minutes; use deterministic message/content-scoped blob identities. | Redeliveries avoid repeat enrichment and concurrent/retried uploads reuse storage identities. |
| Duplicated media handling | Share URL/redirect/stream validation, cancel discarded bodies, cap attempted downloads and total bytes, and use limited concurrency with a shared download deadline. | Less duplicate code and more predictable latency and memory use. |
| Planning budgets reset | Share a 20,000 weighted-token budget and 120-second abort signal across model escalation/namespace retries; check spend before each model call. | Follow-up attempts cannot reset the resource budget. An in-flight call can consume remaining tokens before usage is reported. |

## Deployment

Apply `packages/db/prisma/migrations/20260906120000_inbound_processing_outbox/migration.sql` **before** deploying the updated applications. It adds three message fields and a partial index. Existing messages default to no pending work. Generate the Prisma client and deploy the gateway worker as well as the dashboard.

The migration was applied to the production Neon database on September 7, 2026. Prisma reported the schema current afterward; all three outbox columns exist and all six protected partial indexes remain intact. The application changes have not been deployed, and no live customer messaging was performed.

The outbox delivers at least once into the existing debounced/claimed agent pipeline. It does not promise exactly-once external provider delivery. Ambiguous actions still need reconciliation before retrying. Concurrent first deliveries can overlap enrichment before either message is committed; database uniqueness and deterministic attachment identities prevent duplicate persisted messages and attachment copies.

## Verification

- Repository static verification passed: structure, lint, Knip, typechecking, and production-environment contract tests.
- Full unit and node-script verification passed.
- Full integration/coverage verification passed: 4,004 tests passed, with live/optional tests skipped; all critical coverage thresholds passed.
- All 12 smoke E2E tests passed, including replies, agent approval, the internal send hop, webhook ingestion, and attachments.
- Focused regressions cover policy forwarding, lost leases, journal persistence, partial model failure, outbox recovery, recovery pagination, KB relevance, inactive integrations, TikTok batching, duplicate media ingestion, uncertain HTTP delivery, and planning budgets.
- Production build passed for all seven workspaces. The initial sandboxed attempt could not bind a Turbopack worker port; the approved rerun with local process/port access passed.

Performance benefits are based on eliminated/bounded work, not production load benchmarks. Live-provider/model evaluation remains separate from deterministic local verification.
