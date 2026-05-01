import type { AxialRotation } from "../models";
import type { Vector3 } from "../types";

const DEG_TO_RAD = Math.PI / 180;

export function solveRotation(
  axialRotation: AxialRotation,
  simTimeDays: number,
): { angle: number; axis: Vector3 } {
  const { siderealPeriodDays, axialTiltDeg, initialPhaseDeg = 0 } = axialRotation;
  const tiltRad = axialTiltDeg * DEG_TO_RAD;

  const axis: Vector3 = {
    x: Math.sin(tiltRad),
    y: Math.cos(tiltRad),
    z: 0,
  };

  const angle = initialPhaseDeg * DEG_TO_RAD + (2 * Math.PI * simTimeDays) / siderealPeriodDays;

  return { angle, axis };
}
