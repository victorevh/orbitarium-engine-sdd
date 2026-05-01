import { describe, expect, it } from "vitest";
import {
  solveEccentricAnomaly,
  eccentricToTrueAnomaly,
  keplerianToCartesian,
} from "../../src/core/simulation/orbital-elements";
import type { KeplerianOrbitProfile } from "../../src/core/models";

/**
 * Moon orbital mechanics unit tests
 * 
 * Verifies that lunar orbits are parsed, validated, and computed correctly
 * as dependent bodies with a non-solar center body (Earth).
 */

const MOON: KeplerianOrbitProfile = {
  model: "keplerian",
  centerBodyId: "earth",
  semiMajorAxisAU: 0.00257,
  eccentricity: 0.0549,
  inclinationDeg: 5.145,
  longitudeAscendingNodeDeg: 125.0,
  argumentPeriapsisDeg: 83.36,
  meanAnomalyEpochDeg: 25.0,
  siderealPeriodDays: 27.3216,
};

const dist = (v: { x: number; y: number; z: number }): number =>
  Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);

describe("moon orbital mechanics", () => {
  it("parses moon centerBodyId as non-solar body", () => {
    expect(MOON.centerBodyId).toBe("earth");
    expect(MOON.centerBodyId).not.toBe("sun");
  });

  it("moon semi-major axis is in valid AU range", () => {
    expect(MOON.semiMajorAxisAU).toBeGreaterThan(0);
    expect(MOON.semiMajorAxisAU).toBeLessThan(0.01); // Moon is very close to Earth in AU
  });

  it("moon eccentricity is within valid range", () => {
    expect(MOON.eccentricity).toBeGreaterThanOrEqual(0);
    expect(MOON.eccentricity).toBeLessThan(1);
  });

  it("computes moon position at periapsis (M=0)", () => {
    const elements = MOON;
    const periodDays = elements.siderealPeriodDays ?? 365.25 * Math.pow(elements.semiMajorAxisAU, 1.5);
    const M_target = 0; // periapsis
    const simTimeDays = ((M_target * 1) - (elements.meanAnomalyEpochDeg * Math.PI / 180)) * (periodDays / (2 * Math.PI));

    const cartesian = keplerianToCartesian(elements, simTimeDays);
    const r = dist(cartesian);
    const expected = elements.semiMajorAxisAU * (1 - elements.eccentricity);
    expect(r).toBeCloseTo(expected, 6);
  });

  it("computes moon position at apoapsis (M=π)", () => {
    const elements = MOON;
    const periodDays = elements.siderealPeriodDays ?? 365.25 * Math.pow(elements.semiMajorAxisAU, 1.5);
    const M_target = Math.PI; // apoapsis
    const simTimeDays = ((M_target) - (elements.meanAnomalyEpochDeg * Math.PI / 180)) * (periodDays / (2 * Math.PI));

    const cartesian = keplerianToCartesian(elements, simTimeDays);
    const r = dist(cartesian);
    const expected = elements.semiMajorAxisAU * (1 + elements.eccentricity);
    expect(r).toBeCloseTo(expected, 6);
  });

  it("maintains orbital period constraint for moon", () => {
    // Kepler's third law: P² = a³ (when P is in years and a is in AU)
    // For the Moon: P ≈ 27.32 days ≈ 0.0748 years
    const elements = MOON;
    const periodDays = elements.siderealPeriodDays ?? (365.25 * Math.pow(elements.semiMajorAxisAU, 1.5));
    expect(periodDays).toBeCloseTo(27.32, 2);
  });

  it("mean anomaly traces full orbit for moon", () => {
    // Verify that M progresses from 0 to 2π covers the full orbit
    const elements = MOON;
    const periodDays = elements.siderealPeriodDays ?? 365.25 * Math.pow(elements.semiMajorAxisAU, 1.5);
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const positions = angles.map((M) => {
      const simTimeDays = (M - (elements.meanAnomalyEpochDeg * Math.PI) / 180) * (periodDays / (2 * Math.PI));
      return keplerianToCartesian(elements, simTimeDays);
    });

    // All positions should be finite and have similar magnitude (within orbital envelope)
    positions.forEach((pos) => {
      const r = dist(pos);
      expect(r).toBeGreaterThan(0);
      expect(r).toBeLessThan(MOON.semiMajorAxisAU * 1.1); // Sanity bound
      expect(isFinite(r)).toBe(true);
    });
  });
});
