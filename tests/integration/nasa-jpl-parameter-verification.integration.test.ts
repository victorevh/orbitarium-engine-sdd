import { describe, expect, it } from "vitest";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

interface OrbitalReference {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  siderealPeriodDays: number;
}

const ORBITAL_REFERENCES: Record<string, OrbitalReference> = {
  mercury: { semiMajorAxisAU: 0.387099, eccentricity: 0.20563, inclinationDeg: 7.005, siderealPeriodDays: 58.646 },
  venus: { semiMajorAxisAU: 0.723332, eccentricity: 0.006772, inclinationDeg: 3.39458, siderealPeriodDays: 243.025 },
  earth: { semiMajorAxisAU: 1.0, eccentricity: 0.016709, inclinationDeg: 0, siderealPeriodDays: 1 },
  mars: { semiMajorAxisAU: 1.523688, eccentricity: 0.093315, inclinationDeg: 1.85061, siderealPeriodDays: 1.026 },
  jupiter: { semiMajorAxisAU: 5.2026, eccentricity: 0.048495, inclinationDeg: 1.3053, siderealPeriodDays: 0.41354 },
  saturn: { semiMajorAxisAU: 9.53707, eccentricity: 0.055546, inclinationDeg: 2.48446, siderealPeriodDays: 0.43884 },
  uranus: { semiMajorAxisAU: 19.1913, eccentricity: 0.047318, inclinationDeg: 0.76986, siderealPeriodDays: 0.71833 },
  neptune: { semiMajorAxisAU: 30.069, eccentricity: 0.008606, inclinationDeg: 1.76917, siderealPeriodDays: 0.6713 },
  moon: { semiMajorAxisAU: 0.00257, eccentricity: 0.0549, inclinationDeg: 5.145, siderealPeriodDays: 27.3216 },
};

const SEMI_MAJOR_AXIS_TOLERANCE_PERCENT = 0.1;
const ECCENTRICITY_TOLERANCE = 0.002;
const INCLINATION_TOLERANCE_DEG = 0.05;
const SIDEREAL_PERIOD_TOLERANCE_PERCENT = 2;

const percentDelta = (actual: number, expected: number): number => {
  if (expected === 0) {
    return actual === 0 ? 0 : Number.POSITIVE_INFINITY;
  }

  return Math.abs((actual - expected) / expected) * 100;
};

describe("NASA/JPL parameter verification", () => {
  it("keeps semi-major axis values within +/-0.1% tolerance", () => {
    for (const [bodyId, reference] of Object.entries(ORBITAL_REFERENCES)) {
      const body = solarSystemComplete.bodies.find((candidate) => candidate.bodyId === bodyId);
      expect(body, `${bodyId} must exist in solar-system-complete`).toBeDefined();

      const semiMajorAxisAU = body?.orbit.semiMajorAxisAU;
      expect(typeof semiMajorAxisAU).toBe("number");

      if (typeof semiMajorAxisAU !== "number") {
        continue;
      }

      expect(percentDelta(semiMajorAxisAU, reference.semiMajorAxisAU)).toBeLessThanOrEqual(SEMI_MAJOR_AXIS_TOLERANCE_PERCENT);
    }
  });

  it("keeps eccentricity values within absolute +/-0.002 tolerance", () => {
    for (const [bodyId, reference] of Object.entries(ORBITAL_REFERENCES)) {
      const body = solarSystemComplete.bodies.find((candidate) => candidate.bodyId === bodyId);
      expect(body, `${bodyId} must exist in solar-system-complete`).toBeDefined();

      const eccentricity = body?.orbit.eccentricity;
      expect(typeof eccentricity).toBe("number");

      if (typeof eccentricity !== "number") {
        continue;
      }

      expect(Math.abs(eccentricity - reference.eccentricity)).toBeLessThanOrEqual(ECCENTRICITY_TOLERANCE);
    }
  });

  it("keeps inclination values within absolute +/-0.05 degree tolerance", () => {
    for (const [bodyId, reference] of Object.entries(ORBITAL_REFERENCES)) {
      const body = solarSystemComplete.bodies.find((candidate) => candidate.bodyId === bodyId);
      expect(body, `${bodyId} must exist in solar-system-complete`).toBeDefined();

      const inclinationDeg = body?.orbit.inclinationDeg;
      expect(typeof inclinationDeg).toBe("number");

      if (typeof inclinationDeg !== "number") {
        continue;
      }

      expect(Math.abs(inclinationDeg - reference.inclinationDeg)).toBeLessThanOrEqual(INCLINATION_TOLERANCE_DEG);
    }
  });

  it("keeps sidereal period values within +/-2% tolerance", () => {
    for (const [bodyId, reference] of Object.entries(ORBITAL_REFERENCES)) {
      const body = solarSystemComplete.bodies.find((candidate) => candidate.bodyId === bodyId);
      expect(body, `${bodyId} must exist in solar-system-complete`).toBeDefined();

      const siderealPeriodDays = bodyId === "moon" ? body?.orbit.siderealPeriodDays : body?.axialRotation?.siderealPeriodDays;
      expect(typeof siderealPeriodDays).toBe("number");

      if (typeof siderealPeriodDays !== "number") {
        continue;
      }

      expect(percentDelta(siderealPeriodDays, reference.siderealPeriodDays)).toBeLessThanOrEqual(SIDEREAL_PERIOD_TOLERANCE_PERCENT);
    }
  });
});
