import { describe, expect, it } from "vitest";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

const AU_TO_KM = 149597870.7;

const MOON_REFERENCE = {
  semiMajorAxisAU: 0.00257,
  eccentricity: 0.0549,
  inclinationDeg: 5.145,
  siderealPeriodDays: 27.3216,
};

const PERIOD_TOLERANCE_DAYS = 0.02;
const INCLINATION_TOLERANCE_DEG = 0.05;
const ECCENTRICITY_TOLERANCE = 0.002;
const DISTANCE_TOLERANCE_KM = 8000;

describe("moon parameter accuracy", () => {
  const moon = solarSystemComplete.bodies.find((body) => body.bodyId === "moon");

  it("defines moon as a moon body centered on earth", () => {
    expect(moon).toBeDefined();
    expect(moon?.type).toBe("moon");
    expect(moon?.orbit.centerBodyId).toBe("earth");
  });

  it("matches reference semi-major axis, eccentricity, and inclination tolerances", () => {
    expect(moon).toBeDefined();

    const semiMajorAxis = moon?.orbit.semiMajorAxisAU;
    const eccentricity = moon?.orbit.eccentricity;
    const inclinationDeg = moon?.orbit.inclinationDeg;

    expect(typeof semiMajorAxis).toBe("number");
    expect(typeof eccentricity).toBe("number");
    expect(typeof inclinationDeg).toBe("number");

    if (typeof semiMajorAxis === "number") {
      expect(Math.abs(semiMajorAxis - MOON_REFERENCE.semiMajorAxisAU)).toBeLessThanOrEqual(0.00001);
    }

    if (typeof eccentricity === "number") {
      expect(Math.abs(eccentricity - MOON_REFERENCE.eccentricity)).toBeLessThanOrEqual(ECCENTRICITY_TOLERANCE);
    }

    if (typeof inclinationDeg === "number") {
      expect(Math.abs(inclinationDeg - MOON_REFERENCE.inclinationDeg)).toBeLessThanOrEqual(INCLINATION_TOLERANCE_DEG);
    }
  });

  it("computes perigee and apogee distances close to NASA/JPL values", () => {
    expect(moon).toBeDefined();

    const a = moon?.orbit.semiMajorAxisAU;
    const e = moon?.orbit.eccentricity;

    expect(typeof a).toBe("number");
    expect(typeof e).toBe("number");

    if (typeof a !== "number" || typeof e !== "number") {
      return;
    }

    const perigeeKm = a * (1 - e) * AU_TO_KM;
    const apogeeKm = a * (1 + e) * AU_TO_KM;

    expect(Math.abs(perigeeKm - 356400)).toBeLessThanOrEqual(DISTANCE_TOLERANCE_KM);
    expect(Math.abs(apogeeKm - 406700)).toBeLessThanOrEqual(DISTANCE_TOLERANCE_KM);
  });

  it("keeps orbit and axial sidereal period aligned for tidal locking", () => {
    expect(moon).toBeDefined();

    const orbitPeriod = moon?.orbit.siderealPeriodDays;
    const axialPeriod = moon?.axialRotation?.siderealPeriodDays;

    expect(typeof orbitPeriod).toBe("number");
    expect(typeof axialPeriod).toBe("number");

    if (typeof orbitPeriod !== "number" || typeof axialPeriod !== "number") {
      return;
    }

    expect(Math.abs(orbitPeriod - MOON_REFERENCE.siderealPeriodDays)).toBeLessThanOrEqual(PERIOD_TOLERANCE_DAYS);
    expect(Math.abs(axialPeriod - MOON_REFERENCE.siderealPeriodDays)).toBeLessThanOrEqual(PERIOD_TOLERANCE_DAYS);
    expect(Math.abs(orbitPeriod - axialPeriod)).toBeLessThanOrEqual(PERIOD_TOLERANCE_DAYS);
  });
});
