import type { SceneConfiguration, SimulationSnapshot } from "../models";
import type { SimulationSystem as SimulationSystemPort } from "../engine/system-ports";
import type { TimeContext } from "../time/time-source";
import { solveBodyPosition, solveKeplerianPosition } from "./orbit-solver";
import { solveRotation } from "./rotation-solver";
import { TimeScale } from "./time-scale";
import type { Vector3 } from "../types";

export class SimulationSystem implements SimulationSystemPort {
  private scene: SceneConfiguration | null = null;

  private readonly timeScale = new TimeScale(1);

  private snapshot: SimulationSnapshot = { bodyPositions: {}, bodyStates: {}, simulatedDays: 0 };

  applyScene(scene: SceneConfiguration): void {
    this.scene = scene;
    this.snapshot = {
      bodyPositions: Object.fromEntries(
        scene.bodies.filter((body) => body.orbit.model !== "keplerian").map((body) => [body.bodyId, body.initialPosition]),
      ),
      bodyStates: {},
      simulatedDays: 0,
    };

    this.timeScale.setRate(scene.timeScale?.simDaysPerRealSecond ?? 1);
  }

  update(time: TimeContext): void {
    if (!this.scene) {
      return;
    }

    this.timeScale.advance(time.deltaSeconds);

    const nextPositions = { ...this.snapshot.bodyPositions };
    const nextStates = { ...this.snapshot.bodyStates };

    const resolveCenterPosition = (bodyId: string): Vector3 => {
      if (nextStates[bodyId]) {
        return nextStates[bodyId].positionAU;
      }

      if (nextPositions[bodyId]) {
        return nextPositions[bodyId];
      }

      const body = this.scene?.bodies.find((candidate) => candidate.bodyId === bodyId);
      return body?.initialPosition ?? { x: 0, y: 0, z: 0 };
    };

    for (const body of this.scene.bodies) {
      if (body.orbit.model === "keplerian") {
        const centerPosition = resolveCenterPosition(body.orbit.centerBodyId);
        const positionAU = solveKeplerianPosition(body, centerPosition, this.snapshot.simulatedDays + time.deltaSeconds * (sceneTimeScale(this.scene) ?? 1));
        const rotation = body.axialRotation ? solveRotation(body.axialRotation, this.snapshot.simulatedDays + time.deltaSeconds * (sceneTimeScale(this.scene) ?? 1)) : { angle: 0, axis: { x: 0, y: 1, z: 0 } };

        nextStates[body.bodyId] = {
          positionAU,
          rotationAngle: rotation.angle,
          rotationAxis: rotation.axis,
        };
        delete nextPositions[body.bodyId];
        continue;
      }

      nextPositions[body.bodyId] = solveBodyPosition(this.scene, body, nextPositions, time);
    }

    this.snapshot = {
      bodyPositions: nextPositions,
      bodyStates: nextStates,
      simulatedDays: this.timeScale.getSimTimeDays(),
    };
  }

  getSnapshot(): SimulationSnapshot {
    return this.snapshot;
  }
}

const sceneTimeScale = (scene: SceneConfiguration): number => {
  return scene.timeScale?.simDaysPerRealSecond ?? 1;
};
