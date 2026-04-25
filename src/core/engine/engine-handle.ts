import type { NavigationMode, NavigationState, SceneConfiguration } from "../models";
import type {
  NavigationController as NavigationControllerPort,
  Renderer as RendererPort,
  SimulationSystem as SimulationSystemPort,
} from "./system-ports";
import type { TimeSource } from "../time/time-source";
import { RealTimeSource } from "../time/real-time-source";
import { validateSceneConfiguration } from "../validation/scene-validator";
import type { ValidationResult } from "../validation/validation-error";
import { NavigationController } from "../navigation/navigation-controller";
import { SimulationSystem } from "../simulation/simulation-system";
import { Renderer } from "../../rendering/renderer";

export interface EngineOptions {
  navigationController?: NavigationControllerPort;
  simulationSystem?: SimulationSystemPort;
  renderer?: RendererPort;
  timeSource?: TimeSource;
}

export class EngineHandle {
  private animationToken: ReturnType<typeof setTimeout> | null = null;

  private running = false;

  private scene: SceneConfiguration | null = null;

  private readonly navigationController: NavigationControllerPort;

  private readonly simulationSystem: SimulationSystemPort;

  private readonly renderer: RendererPort;

  private readonly timeSource: TimeSource;

  constructor(options: EngineOptions = {}) {
    this.navigationController = options.navigationController ?? new NavigationController();
    this.simulationSystem = options.simulationSystem ?? new SimulationSystem();
    this.renderer = options.renderer ?? new Renderer();
    this.timeSource = options.timeSource ?? new RealTimeSource();
  }

  loadScene(config: SceneConfiguration): ValidationResult {
    const validation = validateSceneConfiguration(config);
    if (!validation.valid) {
      return validation;
    }

    this.scene = config;
    this.simulationSystem.applyScene(config);
    return validation;
  }

  start(container: HTMLElement): void {
    if (!this.scene) {
      throw new Error("Cannot start engine before loading a valid scene");
    }

    this.renderer.attach(container);
    this.running = true;
    this.frame();
  }

  stop(): void {
    this.running = false;
    if (this.animationToken) {
      clearTimeout(this.animationToken);
      this.animationToken = null;
    }
    this.renderer.detach();
  }

  setNavigationMode(mode: NavigationMode, options?: { targetBodyId?: string }): void {
    if (mode === "orbital") {
      const targetBodyId = options?.targetBodyId;
      if (!targetBodyId) {
        throw new Error("Orbital mode requires targetBodyId");
      }

      const bodyExists = this.scene?.bodies.some((body) => body.bodyId === targetBodyId) ?? false;
      if (!bodyExists) {
        throw new Error(`Unknown orbital target body: ${targetBodyId}`);
      }
    }

    this.navigationController.setMode(mode, options);
  }

  getNavigationState(): NavigationState {
    return this.navigationController.getState();
  }

  setInertia(enabled: boolean): void {
    this.navigationController.setInertia(enabled);
  }

  private frame(): void {
    if (!this.running || !this.scene) {
      return;
    }

    const timeContext = this.timeSource.sample();
    this.navigationController.update(timeContext);
    this.simulationSystem.update(timeContext);

    this.renderer.render({
      scene: this.scene,
      navigation: this.navigationController.getState(),
      simulation: this.simulationSystem.getSnapshot(),
    });

    this.animationToken = setTimeout(() => this.frame(), 16);
  }
}
