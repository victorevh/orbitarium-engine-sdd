import { describe, expect, it } from "vitest";
import { solveRotation } from "../../src/core/simulation/rotation-solver";

describe("solveRotation", () => {
  it("returns angle=0 and Y-axis for tilt=0 at T=0", () => {
    const result = solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0 }, 0);
    expect(result.angle).toBeCloseTo(0, 8);
    expect(result.axis.x).toBeCloseTo(0, 8);
    expect(result.axis.y).toBeCloseTo(1, 8);
    expect(result.axis.z).toBeCloseTo(0, 8);
  });

  it("returns angle≈2π after one full sidereal rotation period", () => {
    const result = solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0 }, 1);
    expect(result.angle).toBeCloseTo(2 * Math.PI, 5);
  });

  it("Earth-like tilt (23.44°) produces correct axis in XY plane", () => {
    const tiltDeg = 23.44;
    const tiltRad = tiltDeg * (Math.PI / 180);
    const result = solveRotation({ siderealPeriodDays: 0.997, axialTiltDeg: tiltDeg }, 0);
    expect(result.axis.x).toBeCloseTo(Math.sin(tiltRad), 5);
    expect(result.axis.y).toBeCloseTo(Math.cos(tiltRad), 5);
    expect(result.axis.z).toBeCloseTo(0, 8);
  });

  it("initialPhaseDeg=90 shifts angle by π/2 at T=0", () => {
    const result = solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0, initialPhaseDeg: 90 }, 0);
    expect(result.angle).toBeCloseTo(Math.PI / 2, 5);
  });

  it("axis is normalized (unit length) for any tilt", () => {
    const tilts = [0, 23.44, 45, 90, 177.36];
    for (const tiltDeg of tilts) {
      const result = solveRotation({ siderealPeriodDays: 1, axialTiltDeg: tiltDeg }, 0);
      const length = Math.sqrt(result.axis.x ** 2 + result.axis.y ** 2 + result.axis.z ** 2);
      expect(length).toBeCloseTo(1, 8);
    }
  });

  it("angle increases monotonically with simTimeDays", () => {
    const times = [0, 0.5, 1, 1.5, 2];
    const angles = times.map((t) => solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0 }, t).angle);
    for (let i = 1; i < angles.length; i++) {
      expect(angles[i]).toBeGreaterThan(angles[i - 1]);
    }
  });
});
