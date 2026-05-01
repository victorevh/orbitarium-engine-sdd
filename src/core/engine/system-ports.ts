import type { NavigationMode, NavigationState, RenderInput, SceneConfiguration, SimulationSnapshot } from "../models";
import type { TimeContext, TimeSource } from "../time/time-source";

export interface NavigationController {
  update(time: TimeContext): void;
  setMode(mode: NavigationMode, options?: { targetBodyId?: string }): void;
  getState(): NavigationState;
  setInertia(enabled: boolean): void;
}

export interface SimulationSystem {
  update(time: TimeContext): void;
  applyScene(scene: SceneConfiguration): void;
  getSnapshot(): SimulationSnapshot;
  setTimeScale(rate: number): void;
}

export interface Renderer {
  render(input: RenderInput): void;
  attach(container: HTMLElement): void;
  detach(): void;
}

export interface TimePort {
  source: TimeSource;
}

export interface SystemPorts {
  navigationController: NavigationController;
  simulationSystem: SimulationSystem;
  renderer: Renderer;
  time: TimePort;
}
