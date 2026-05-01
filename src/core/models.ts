import type { Quaternion, Vector3 } from "./types";

export type BodyType = "star" | "planet" | "moon";
export type OrbitModel = "circular" | "elliptical" | "keplerian";
export type NavigationMode = "free" | "orbital";

export interface ScaleProfile {
  minZoom: number;
  maxZoom: number;
  renderUnitsPerAU?: number;
}

export interface RotationProfile {
  angularSpeed: number;
  axis: Vector3;
  phaseOffset?: number;
}

export interface AxialRotation {
  siderealPeriodDays: number;
  axialTiltDeg: number;
  initialPhaseDeg?: number;
}

export interface OrbitProfile {
  model: OrbitModel;
  centerBodyId: string;
  radius?: number;
  semiMajorAxis?: number;
  semiMinorAxis?: number;
  angularSpeed: number;
  phaseOffset?: number;
  semiMajorAxisAU?: number;
  eccentricity?: number;
  inclinationDeg?: number;
  longitudeAscendingNodeDeg?: number;
  argumentPeriapsisDeg?: number;
  meanAnomalyEpochDeg?: number;
}

export interface KeplerianOrbitProfile {
  model: "keplerian";
  centerBodyId: string;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeAscendingNodeDeg: number;
  argumentPeriapsisDeg: number;
  meanAnomalyEpochDeg: number;
  siderealPeriodDays?: number;
}

export interface CelestialBodyDefinition {
  bodyId: string;
  type: BodyType;
  size: number;
  initialPosition: Vector3;
  rotation: RotationProfile;
  orbit: OrbitProfile;
  axialRotation?: AxialRotation;
}

export interface LightingSourceDefinition {
  lightId: string;
  sourceBodyId: string;
  intensity: number;
  range: number;
}

export interface TimeScaleConfig {
  simDaysPerRealSecond: number;
}

export interface SourceMetadata {
  epoch?: string;
  source?: string;
  referenceDate?: string;
  notes?: string;
}

export interface SceneConfiguration {
  sceneId: string;
  name: string;
  coordinateSystem: "right-handed";
  scaleProfile: ScaleProfile;
  bodies: CelestialBodyDefinition[];
  lights: LightingSourceDefinition[];
  timeScale?: TimeScaleConfig;
  sourceMetadata?: SourceMetadata;
}

export interface NavigationState {
  mode: NavigationMode;
  position: Vector3;
  orientation: Quaternion;
  inertiaEnabled: boolean;
  orbitalTargetBodyId?: string;
  lastUpdateTick: number;
}

export interface SimBodyState {
  positionAU: Vector3;
  rotationAngle: number;
  rotationAxis: Vector3;
}

export interface SimulationSnapshot {
  bodyPositions: Record<string, Vector3>;
  bodyStates: Record<string, SimBodyState>;
  simulatedDays: number;
}

export interface RenderInput {
  scene: SceneConfiguration;
  navigation: NavigationState;
  simulation: SimulationSnapshot;
}
