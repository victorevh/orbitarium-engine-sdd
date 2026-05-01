import { describe, expect, it } from "vitest";
import {
  solveEccentricAnomaly,
  eccentricToTrueAnomaly,
  keplerianToCartesian,
} from "../../src/core/simulation/orbital-elements";
import type { KeplerianOrbitProfile } from "../../src/core/models";

const EARTH: KeplerianOrbitProfile = {
  model: "keplerian",
  centerBodyId: "sun",
  semiMajorAxisAU: 1.0,
  eccentricity: 0.01671,
  inclinationDeg: 0.0,
  longitudeAscendingNodeDeg: 348.739,
  argumentPeriapsisDeg: 114.207,
  meanAnomalyEpochDeg: 357.517,
};

const dist = (v: { x: number; y: number; z: number }): number =>
  Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);

describe("solveEccentricAnomaly", () => {
  it("returns M exactly when e=0 (circular orbit)", () => {
    expect(solveEccentricAnomaly(0, 0)).toBeCloseTo(0, 8);
    expect(solveEccentricAnomaly(Math.PI, 0)).toBeCloseTo(Math.PI, 8);
    expect(solveEccentricAnomaly(Math.PI / 2, 0)).toBeCloseTo(Math.PI / 2, 8);
  });

  it("result satisfies Kepler's equation for Earth eccentricity (e=0.0167)", () => {
    const M = Math.PI / 2;
    const e = 0.0167;
    const E = solveEccentricAnomaly(M, e);
    expect(E - e * Math.sin(E)).toBeCloseTo(M, 5);
  });

  it("result satisfies Kepler's equation for Mercury eccentricity (e=0.2056)", () => {
    const M = 1.0;
    const e = 0.2056;
    const E = solveEccentricAnomaly(M, e);
    expect(E - e * Math.sin(E)).toBeCloseTo(M, 5);
  });

  it("returns finite values for all tested inputs", () => {
    expect(isFinite(solveEccentricAnomaly(0, 0))).toBe(true);
    expect(isFinite(solveEccentricAnomaly(Math.PI, 0.0167))).toBe(true);
    expect(isFinite(solveEccentricAnomaly(2 * Math.PI, 0.2056))).toBe(true);
  });
});

describe("eccentricToTrueAnomaly", () => {
  it("returns 0 at E=0 for any eccentricity", () => {
    expect(eccentricToTrueAnomaly(0, 0)).toBeCloseTo(0, 8);
    expect(eccentricToTrueAnomaly(0, 0.0167)).toBeCloseTo(0, 5);
  });

  it("returns π at E=π (apoapsis) for any eccentricity", () => {
    expect(eccentricToTrueAnomaly(Math.PI, 0)).toBeCloseTo(Math.PI, 8);
    expect(eccentricToTrueAnomaly(Math.PI, 0.0167)).toBeCloseTo(Math.PI, 5);
  });
});

describe("keplerianToCartesian", () => {
  it("Earth at T=0 is near perihelion (~0.983 AU from origin)", () => {
    const pos = keplerianToCartesian(EARTH, 0);
    expect(isFinite(pos.x)).toBe(true);
    expect(isFinite(pos.y)).toBe(true);
    expect(isFinite(pos.z)).toBe(true);
    expect(dist(pos)).toBeCloseTo(0.983, 1);
  });

  it("Earth at T=182.6 days is near aphelion with x-component sign flipped vs epoch", () => {
    const p0 = keplerianToCartesian(EARTH, 0);
    const p182 = keplerianToCartesian(EARTH, 182.6);
    expect(dist(p182)).toBeCloseTo(1.017, 1);
    expect(Math.sign(p182.x)).not.toBe(Math.sign(p0.x));
  });

  it("Earth at T=365.25 days returns to within 5% of epoch position", () => {
    const p0 = keplerianToCartesian(EARTH, 0);
    const p365 = keplerianToCartesian(EARTH, 365.25);
    const tolerance = 0.05 * dist(p0);
    expect(Math.abs(p365.x - p0.x)).toBeLessThan(tolerance);
    expect(Math.abs(p365.y - p0.y)).toBeLessThan(tolerance);
    expect(Math.abs(p365.z - p0.z)).toBeLessThan(tolerance);
  });

  it("i=90° inclination produces significant displacement along ecliptic north (Y axis)", () => {
    const body90: KeplerianOrbitProfile = {
      model: "keplerian",
      centerBodyId: "sun",
      semiMajorAxisAU: 1.0,
      eccentricity: 0.0,
      inclinationDeg: 90.0,
      longitudeAscendingNodeDeg: 0.0,
      argumentPeriapsisDeg: 0.0,
      meanAnomalyEpochDeg: 90.0, // quarter-orbit ahead → Y displacement visible
    };
    const pos = keplerianToCartesian(body90, 0);
    expect(Math.abs(pos.y)).toBeGreaterThan(0.5);
  });

  it("e=0 produces circular path (constant distance from origin)", () => {
    const circular: KeplerianOrbitProfile = {
      model: "keplerian",
      centerBodyId: "sun",
      semiMajorAxisAU: 1.0,
      eccentricity: 0.0,
      inclinationDeg: 0.0,
      longitudeAscendingNodeDeg: 0.0,
      argumentPeriapsisDeg: 0.0,
      meanAnomalyEpochDeg: 0.0,
    };
    const times = [0, 91, 182, 273, 365];
    const distances = times.map((t) => dist(keplerianToCartesian(circular, t)));
    const maxDist = Math.max(...distances);
    const minDist = Math.min(...distances);
    expect(maxDist - minDist).toBeLessThan(0.01);
    distances.forEach((d) => expect(d).toBeCloseTo(1.0, 2));
  });
});
