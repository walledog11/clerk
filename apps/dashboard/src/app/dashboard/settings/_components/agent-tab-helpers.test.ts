import { describe, expect, it } from "vitest";
import { AGENT_SETTINGS_DEFAULTS } from "@/lib/agent/settings";
import type { OrgSettings } from "@/types";
import {
  agentSettingsReducer,
  buildSettingsPayload,
  hydrateSettings,
  rawInputsFor,
} from "./agent-tab-helpers";

function makeSettings(overrides: Partial<OrgSettings> = {}): OrgSettings {
  return {
    ...AGENT_SETTINGS_DEFAULTS,
    ...overrides,
    toolsEnabled: {
      ...AGENT_SETTINGS_DEFAULTS.toolsEnabled,
      ...(overrides.toolsEnabled ?? {}),
    },
  };
}

describe("agent tab helpers", () => {
  it("hydrates legacy timezone offsets into curated IANA timezones", () => {
    const hydrated = hydrateSettings(makeSettings({
      digestTimezone: "Etc/GMT+5",
      digestTimezoneOffset: -5,
      businessHoursTimezoneOffset: -8,
    }));

    expect(hydrated.digestTimezone).toBe("America/New_York");
    expect(hydrated.businessHoursTimezone).toBe("America/Los_Angeles");
  });

  it("preserves explicit non-curated IANA timezones", () => {
    const hydrated = hydrateSettings(makeSettings({
      digestTimezone: "America/Tijuana",
      businessHoursTimezone: "Asia/Kolkata",
      digestTimezoneOffset: -8,
      businessHoursTimezoneOffset: 5,
    }));

    expect(hydrated.digestTimezone).toBe("America/Tijuana");
    expect(hydrated.businessHoursTimezone).toBe("Asia/Kolkata");
  });

  it("builds the API payload from text inputs", () => {
    const payload = buildSettingsPayload(
      makeSettings({ agentName: "   " }),
      {
        maxRefund: "12.50",
        dailyRefundCap: "",
        dailyLLMSpendCap: "not-a-number",
        maxIter: "0",
        digestHour: "99",
        digestSecondHour: "",
        bhStart: "bad",
        bhEnd: "-3",
      }
    );

    expect(payload.agentName).toBe("Clerk");
    expect(payload.maxRefundAmount).toBe(12.5);
    expect(payload.dailyRefundCap).toBeNull();
    expect(payload.dailyLLMSpendCapUsd).toBeNull();
    expect(payload.maxIterations).toBe(10);
    expect(payload.digestHour).toBe(23);
    expect(payload.digestSecondHour).toBe(17);
    expect(payload.businessHoursStart).toBe(9);
    expect(payload.businessHoursEnd).toBe(0);
  });

  it("serializes settings into raw form inputs", () => {
    const raw = rawInputsFor(makeSettings({
      maxRefundAmount: null,
      dailyRefundCap: 200,
      dailyLLMSpendCapUsd: 20,
      maxIterations: 7,
      digestHour: 10,
      digestSecondHour: 18,
      businessHoursStart: 6,
      businessHoursEnd: 14,
    }));

    expect(raw).toEqual({
      maxRefund: "",
      dailyRefundCap: "200",
      dailyLLMSpendCap: "20",
      maxIter: "7",
      digestHour: "10",
      digestSecondHour: "18",
      bhStart: "6",
      bhEnd: "14",
    });
  });

  it("applies set and reset reducer actions", () => {
    const base = makeSettings({ agentName: "Clerk" });
    const changed = agentSettingsReducer(base, { type: "set", patch: { agentName: "Ada" } });
    const reset = agentSettingsReducer(changed, { type: "reset", payload: base });

    expect(changed.agentName).toBe("Ada");
    expect(base.agentName).toBe("Clerk");
    expect(reset).toBe(base);
  });
});
