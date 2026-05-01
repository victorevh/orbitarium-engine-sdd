import type { CelestialBodyDefinition, KeplerianOrbitProfile, SceneConfiguration } from "../models";
import type { TimeContext } from "../time/time-source";
import type { Vector3 } from "../types";
import { keplerianToCartesian } from "./orbital-elements";

const angleFromTime = (speed: number, phaseOffset = 0, nowSeconds: number): number => {
  return speed * nowSeconds + phaseOffset;
};

const resolveCenter = (scene: SceneConfiguration, body: CelestialBodyDefinition, positions: Record<string, Vector3>): Vector3 => {
  if (body.orbit.centerBodyId === body.bodyId) {
    return body.initialPosition;
  }

  return positions[body.orbit.centerBodyId] ?? body.initialPosition;
};

const resolveKeplerianCenter = (
  body: CelestialBodyDefinition,
  positions: Record<string, Vector3>,
): Vector3 => {
  if (body.orbit.centerBodyId === body.bodyId) {
    return body.initialPosition;
  }

  return positions[body.orbit.centerBodyId] ?? body.initialPosition;
};

export const solveBodyPosition = (
  scene: SceneConfiguration,
  body: CelestialBodyDefinition,
  positions: Record<string, Vector3>,
  time: TimeContext,
): Vector3 => {
  const center = resolveCenter(scene, body, positions);
  const angle = angleFromTime(body.orbit.angularSpeed, body.orbit.phaseOffset, time.nowSeconds);

  if (body.orbit.model === "circular") {
    const radius = body.orbit.radius ?? 0;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y,
      z: center.z + Math.sin(angle) * radius,
    };
  }

  const a = body.orbit.semiMajorAxis ?? 0;
  const b = body.orbit.semiMinorAxis ?? 0;
  return {
    x: center.x + Math.cos(angle) * a,
    y: center.y,
    z: center.z + Math.sin(angle) * b,
  };
};

export const solveKeplerianPosition = (
  body: CelestialBodyDefinition,
  centerPosition: Vector3,
  simTimeDays: number,
): Vector3 => {
  if (body.orbit.model !== "keplerian") {
    return centerPosition;
  }

  const orbitalPosition = keplerianToCartesian(body.orbit as KeplerianOrbitProfile, simTimeDays);

  return {
    x: centerPosition.x + orbitalPosition.x,
    y: centerPosition.y + orbitalPosition.y,
    z: centerPosition.z + orbitalPosition.z,
  };
};
