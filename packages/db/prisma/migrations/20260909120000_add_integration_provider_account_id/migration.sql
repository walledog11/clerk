-- SocialAPI ingress resolved `data.account_id` through two environment
-- variables pinning one provider account to one integration row. That is one
-- merchant by construction, so merchant self-connect needs the account id in an
-- indexed column instead.
--
-- The column is separate from `external_account_id` on purpose.
-- `external_account_id` holds the native platform id, and
-- integrations_instagram_account_unique on it is what stops one Instagram
-- account being claimed by two workspaces. Storing a provider id there would
-- give the same Instagram account two different values under two brands, and
-- that index would stop meaning anything.
ALTER TABLE "integrations" ADD COLUMN "provider_account_id" VARCHAR(255);

-- Adopt the rows the controlled spike pinned. `metadata.instagram.transport`
-- is the only signal that a row is provider-fronted; rows written before it
-- existed are direct Meta and stay null.
UPDATE "integrations"
SET "provider_account_id" = "metadata"->'instagram'->>'socialApiAccountId'
WHERE "platform" = 'ig_dm'
  AND "metadata"->'instagram'->>'transport' = 'socialapi'
  AND "metadata"->'instagram'->>'socialApiAccountId' IS NOT NULL;

-- One provider account resolves to exactly one integration. Without this the
-- webhook lookup below is ambiguous, and an operator who pinned the same
-- account into two workspaces would have both ingesting the same DMs.
--
-- Abort with the offending ids rather than failing on index creation, so a
-- deploy that hits a duplicate pin says which one to clean up. This mirrors
-- integrations_instagram_account_unique and integrations_shopify_account_unique.
DO $$
DECLARE
  duplicate_accounts TEXT;
BEGIN
  SELECT string_agg(duplicate."provider_account_id", ', ' ORDER BY duplicate."provider_account_id")
  INTO duplicate_accounts
  FROM (
    SELECT "provider_account_id"
    FROM "integrations"
    WHERE "provider_account_id" IS NOT NULL
    GROUP BY "provider_account_id"
    HAVING COUNT(*) > 1
  ) AS duplicate;

  IF duplicate_accounts IS NOT NULL THEN
    RAISE EXCEPTION 'Provider accounts are connected to multiple integrations: %', duplicate_accounts
      USING HINT = 'Audit ownership and remove the stale ig_dm rows before retrying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX "integrations_provider_account_unique"
ON "integrations"("provider_account_id")
WHERE "provider_account_id" IS NOT NULL;
