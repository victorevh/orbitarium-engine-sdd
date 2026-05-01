export type {
  AxialRotation,
  BodyType,
  CelestialBodyDefinition,
  KeplerianOrbitProfile,
  LightingSourceDefinition,
  NavigationMode,
  NavigationState,
  OrbitProfile,
  RenderInput,
  RotationProfile,
  ScaleProfile,
  SceneConfiguration,
  SimBodyState,
  SimulationSnapshot,
  SourceMetadata,
  TimeScaleConfig,
} from "./core/models";

export type { ValidationError, ValidationResult } from "./core/validation/validation-error";
export type { TimeContext, TimeSource } from "./core/time/time-source";

// Engine orchestrator that coordinates navigation, simulation, rendering, and time sampling.
export type { ScaleTransform } from "./core/simulation/scale-mapping";
export { createScaleTransform } from "./core/simulation/scale-mapping";

export { EngineHandle } from "./core/engine/engine-handle";
export { NavigationController } from "./core/navigation/navigation-controller";
export { SimulationSystem } from "./core/simulation/simulation-system";
export { Renderer } from "./rendering/renderer";
// Default real-time clock implementation used when no custom TimeSource is provided.
export { RealTimeSource } from "./core/time/real-time-source";
export { validateSceneConfiguration } from "./core/validation/scene-validator";
