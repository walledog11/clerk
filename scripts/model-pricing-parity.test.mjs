import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LLM_PRICING,
  LLM_PRICING_AS_OF,
  NANO_DOLLARS_PER_USD,
  usageToNanoDollars,
} from '@shopkeeper/db';
import {
  estimateModelUsageCostUsd,
  MODEL_PRICING_AS_OF,
} from '@shopkeeper/agent/model-cost';

const representativeUsage = {
  inputTokens: 101,
  outputTokens: 37,
  cacheCreationInputTokens: 53,
  cacheCreation1hInputTokens: 29,
  cacheReadInputTokens: 211,
};

test('production and paid-eval model pricing stay in parity', () => {
  assert.equal(MODEL_PRICING_AS_OF, LLM_PRICING_AS_OF);

  for (const model of Object.keys(LLM_PRICING)) {
    const productionUsd = usageToNanoDollars(representativeUsage, model)
      / NANO_DOLLARS_PER_USD;
    const evalUsd = estimateModelUsageCostUsd(model, representativeUsage);
    assert.equal(evalUsd, productionUsd, `${model} pricing diverged`);
  }
});

test('production and paid-eval accounting both reject an unpriced model', () => {
  const unknownModel = 'claude-unpriced-future-model';
  assert.throws(
    () => usageToNanoDollars(representativeUsage, unknownModel),
    /No committed API price/,
  );
  assert.throws(
    () => estimateModelUsageCostUsd(unknownModel, representativeUsage),
    /No committed API price/,
  );
});
