import { describe, expect, it } from "vitest";
import {
  brandSafetyMultiplier,
  clamp,
  confidenceScore,
  logistic100,
} from "@/lib/cmv-algorithm";

describe("clamp", () => {
  it("clamps to bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("logistic100", () => {
  it("is ~50 at delta 0 for positive k", () => {
    const y = logistic100(3, 0);
    expect(y).toBeCloseTo(50, 5);
  });

  it("approaches 100 for large positive delta", () => {
    expect(logistic100(3, 4)).toBeGreaterThan(99);
  });
});

describe("confidenceScore", () => {
  it("ranges 0.6–1.0 based on signal count", () => {
    const none = confidenceScore({
      ig_followers: null,
      engagement_rate: null,
      rating: null,
      goals: null,
      minutes_played: null,
    });
    expect(none).toBe(0.6);

    const all = confidenceScore({
      ig_followers: 1000,
      engagement_rate: 0.05,
      rating: 7,
      goals: 5,
      minutes_played: 2000,
    });
    expect(all).toBe(1.0);
  });
});

describe("brandSafetyMultiplier", () => {
  it("returns 1 when undefined", () => {
    expect(brandSafetyMultiplier(undefined)).toBe(1);
  });

  it("applies low-engagement penalty for large IG", () => {
    const m = brandSafetyMultiplier({
      ig_followers: 2_000_000,
      engagement_rate: 0.1,
      tt_followers: 100,
      yt_subscribers: 0,
      x_followers: 0,
    });
    expect(m).toBeLessThan(1);
    expect(m).toBeGreaterThanOrEqual(0);
  });
});
