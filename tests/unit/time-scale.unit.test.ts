import { describe, expect, it } from "vitest";
import { TimeScale } from "../../src/core/simulation/time-scale";

describe("TimeScale", () => {
  it("initializes with simTimeDays = 0", () => {
    const ts = new TimeScale(1);
    expect(ts.getSimTimeDays()).toBe(0);
  });

  it("advance(1) accumulates 1 simulated day at rate=1", () => {
    const ts = new TimeScale(1);
    ts.advance(1);
    expect(ts.getSimTimeDays()).toBeCloseTo(1, 8);
  });

  it("advance(1) accumulates 365.25 simulated days at rate=365.25", () => {
    const ts = new TimeScale(365.25);
    ts.advance(1);
    expect(ts.getSimTimeDays()).toBeCloseTo(365.25, 5);
  });

  it("accumulates correctly over 100 small ticks (delta=0.016)", () => {
    const ts = new TimeScale(1);
    for (let i = 0; i < 100; i++) {
      ts.advance(0.016);
    }
    expect(ts.getSimTimeDays()).toBeCloseTo(1.6, 3);
  });

  it("getSimTimeDays returns current accumulated value after multiple advances", () => {
    const ts = new TimeScale(1);
    ts.advance(10);
    expect(ts.getSimTimeDays()).toBeCloseTo(10, 8);
    ts.advance(5);
    expect(ts.getSimTimeDays()).toBeCloseTo(15, 8);
  });

  it("constructor rate is applied on first advance", () => {
    const ts = new TimeScale(2);
    ts.advance(1);
    expect(ts.getSimTimeDays()).toBeCloseTo(2, 8);
  });

  it("setRate changes rate for future advances without resetting simTimeDays", () => {
    const ts = new TimeScale(1);
    ts.advance(1); // simTimeDays = 1
    ts.setRate(2);
    ts.advance(1); // simTimeDays = 1 + 2 = 3
    expect(ts.getSimTimeDays()).toBeCloseTo(3, 8);
  });
});
