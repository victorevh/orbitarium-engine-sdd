import type { KeplerianOrbitProfile } from "../models";
import type { Vector3 } from "../types";

const TWO_PI = 2 * Math.PI;
const DEG_TO_RAD = Math.PI / 180;
const NR_TOL = 1e-8;
const NR_MAX_ITER = 100;

export function solveEccentricAnomaly(M: number, e: number): number {
  let E = M;
  for (let iter = 0; iter < NR_MAX_ITER; iter++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < NR_TOL) break;
  }
  return E;
}

export function eccentricToTrueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}
export function keplerianToCartesian(elements: KeplerianOrbitProfile, simTimeDays: number): Vector3 {
  const a = elements.semiMajorAxisAU;
  const e = elements.eccentricity;
  const i = elements.inclinationDeg * DEG_TO_RAD;
  const Omega = elements.longitudeAscendingNodeDeg * DEG_TO_RAD;
  const w = elements.argumentPeriapsisDeg * DEG_TO_RAD;
  const M0 = elements.meanAnomalyEpochDeg * DEG_TO_RAD;

  // Use provided period if available (for non-solar orbits), otherwise calculate from Kepler's 3rd law
  const periodDays = elements.siderealPeriodDays ?? 365.25 * Math.pow(Math.max(a, 1), 1.5);
  const M = M0 + (TWO_PI * simTimeDays) / periodDays;

  const E = solveEccentricAnomaly(M, e);
  const nu = eccentricToTrueAnomaly(E, e);
  const r = a * (1 - e * Math.cos(E));

  // Argument of latitude: ω + ν
  const theta = w + nu;
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  return {
    x: r * (cosOmega * cosTheta - sinOmega * sinTheta * cosI),
    y: r * (sinI * sinTheta),
    z: -(r * (sinOmega * cosTheta + cosOmega * sinTheta * cosI)),
  };
}
