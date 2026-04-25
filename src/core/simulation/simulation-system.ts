import type { SceneConfiguration, SimulationSnapshot } from "../models";
import type { SimulationSystem as SimulationSystemPort } from "../engine/system-ports";
import type { TimeContext } from "../time/time-source";
import { solveBodyPosition } from "./orbit-solver";

export class SimulationSystem implements SimulationSystemPort {
  private scene: SceneConfiguration | null = null;

  private snapshot: SimulationSnapshot = { bodyPositions: {} };

  applyScene(scene: SceneConfiguration): void {
    this.scene = scene;
    this.snapshot = {
      bodyPositions: Object.fromEntries(scene.bodies.map((body) => [body.bodyId, body.initialPosition])),
    };
  }

  update(time: TimeContext): void {
    if (!this.scene) {
      return;
    }

    const nextPositions = { ...this.snapshot.bodyPositions };
    for (const body of this.scene.bodies) {
      nextPositions[body.bodyId] = solveBodyPosition(this.scene, body, nextPositions, time);
    }

    this.snapshot = { bodyPositions: nextPositions };
  }

  getSnapshot(): SimulationSnapshot {
    return this.snapshot;
  }
}
