# Data Model: Realistic Solar System Simulation

**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2026-04-30

All types below are TypeScript. New additions are marked **NEW**; modified existing types
are marked **EXTENDED**. Unchanged existing types are referenced but not repeated.

---

## OrbitModel (EXTENDED)

```typescript
// Was: "circular" | "elliptical"
export type OrbitModel = "circular" | "elliptical" | "keplerian";
```

---

## KeplerianOrbitProfile (NEW)

New discriminant variant of `OrbitProfile`. Used when `orbit.model === "keplerian"`.
Position is computed via Kepler equation (Newton-Raphson) from total simulated time.

```typescript
export interface KeplerianOrbitProfile {
  model: "keplerian";
  centerBodyId: string;               // Body ID of the center (always Sun for planets)
  semiMajorAxisAU: number;            // a: semi-major axis in Astronomical Units (> 0)
  eccentricity: number;               // e: orbital eccentricity (0 ≤ e < 1)
  inclinationDeg: number;             // i: inclination relative to ecliptic (degrees)
  longitudeAscendingNodeDeg: number;  // Ω: longitude of ascending node (degrees)
  argumentPeriapsisDeg: number;       // ω: argument of periapsis (degrees)
  meanAnomalyEpochDeg: number;        // M₀: mean anomaly at J2000 epoch (degrees)
}
```

**Validation rules**:
- `eccentricity` MUST satisfy `0 ≤ e < 1`; hyperbolic orbits are not supported.
- `semiMajorAxisAU` MUST be `> 0`.
- All angle fields are finite numbers; values outside 0–360 are valid (they are wrapped
  internally); no schema error is raised for out-of-range angles.
- `centerBodyId` MUST reference a body defined earlier in the scene's `bodies` array.

**Derived values** (computed at runtime, not stored in config):
- `orbitalPeriodDays = 365.25 × semiMajorAxisAU^1.5` (Kepler's third law)
- `meanAnomaly(T) = M₀_rad + 2π × T_days / orbitalPeriodDays`

---

## AxialRotation (NEW)

Optional extension on `CelestialBodyDefinition` for Keplerian bodies. When present,
overrides the existing `rotation.angularSpeed` for simulation purposes.

```typescript
export interface AxialRotation {
  siderealPeriodDays: number;  // Sidereal rotation period in Earth days (> 0)
  axialTiltDeg: number;        // Obliquity from ecliptic north in degrees (0–180)
  initialPhaseDeg?: number;    // Initial rotation angle at epoch (degrees, default 0)
}
```

**Derived rotation axis** (computed at runtime):
```
rotationAxis = Vector3(sin(axialTiltDeg × π/180), cos(axialTiltDeg × π/180), 0)
```

**Rotation angle at simulated time T (days)**:
```
θ(T) = (initialPhaseDeg ?? 0) × (π/180) + 2π × T / siderealPeriodDays
```

**Validation rules**:
- `siderealPeriodDays` MUST be `> 0`.
- `axialTiltDeg` MUST be in the range `[0, 180]`.

---

## ScaleProfile (EXTENDED)

```typescript
export interface ScaleProfile {
  minZoom: number;            // Existing — unchanged
  maxZoom: number;            // Existing — unchanged
  renderUnitsPerAU?: number;  // NEW — AU to Three.js world unit factor; default 100
}
```

**Validation rules**:
- `renderUnitsPerAU`, when present, MUST be `> 0`.
- If absent, `100` is used by the renderer and `ScaleTransform`.

---

## TimeScaleConfig (NEW)

```typescript
export interface TimeScaleConfig {
  simDaysPerRealSecond: number;  // Simulated days elapsed per real second (> 0)
}
```

**Examples**:
- `{ simDaysPerRealSecond: 1 }` → 1 real second = 1 simulated day (Earth orbits in ~365 s)
- `{ simDaysPerRealSecond: 365.25 }` → 1 real second = 1 simulated year
- `{ simDaysPerRealSecond: 0.001 }` → nearly paused (slow-motion observation)

**Validation rules**:
- `simDaysPerRealSecond` MUST be `> 0`.

---

## SceneConfiguration (EXTENDED)

```typescript
export interface SceneConfiguration {
  sceneId: string;                          // Existing — unchanged
  name: string;                             // Existing — unchanged
  coordinateSystem: "right-handed";         // Existing — unchanged
  scaleProfile: ScaleProfile;               // Existing — extended with renderUnitsPerAU
  bodies: CelestialBodyDefinition[];        // Existing — bodies may now use keplerian orbit
  lights: LightingSourceDefinition[];       // Existing — unchanged
  timeScale?: TimeScaleConfig;              // NEW — optional; default { simDaysPerRealSecond: 1 }
}
```

---

## CelestialBodyDefinition (EXTENDED)

```typescript
export interface CelestialBodyDefinition {
  bodyId: string;                    // Existing — unchanged
  type: BodyType;                    // Existing — unchanged
  size: number;                      // Existing — unchanged (visual size, renderer-owned)
  initialPosition: Vector3;          // Existing — unchanged (used for circular/elliptical)
  rotation: RotationProfile;         // Existing — unchanged (used for circular/elliptical)
  orbit: OrbitProfile;               // Existing — union now includes "keplerian" variant
  axialRotation?: AxialRotation;     // NEW — optional; used when orbit.model === "keplerian"
}
```

**Note**: For Keplerian bodies, `axialRotation` is the authoritative rotation source.
The existing `rotation` field is still required by the schema for backward compatibility
but is not used by the simulation for Keplerian bodies.

---

## SimBodyState (NEW)

Per-body simulation state for Keplerian bodies in `SimulationSnapshot`. All values are
in simulation space (AU for position). The rendering layer applies `ScaleTransform` to
convert to render space.

```typescript
export interface SimBodyState {
  positionAU: Vector3;    // Heliocentric position in Astronomical Units
  rotationAngle: number;  // Current spin angle in radians (monotonically increasing)
  rotationAxis: Vector3;  // Normalized spin axis in ecliptic frame
}
```

---

## SimulationSnapshot (EXTENDED)

```typescript
export interface SimulationSnapshot {
  bodyPositions: Record<string, Vector3>;        // Existing — circular/elliptical bodies only
  bodyStates: Record<string, SimBodyState>;      // NEW — Keplerian bodies only (AU-space)
  simulatedDays: number;                         // NEW — total elapsed simulated days
}
```

**Partitioning rule**: A given `bodyId` appears in EITHER `bodyPositions` OR `bodyStates`,
never both. The renderer checks which map contains a body's state.

**Backward compatibility**: Existing code that reads only `bodyPositions` continues to work
for scenes that use only circular/elliptical orbits. The new fields initialize as empty
records and `simulatedDays = 0`.

---

## ScaleTransform (NEW — rendering layer utility)

Pure stateless utility in `src/core/simulation/scale-mapping.ts`. Instantiated by the
rendering setup (`apps/demo/main.ts`), not by `SimulationSystem`.

```typescript
export interface ScaleTransform {
  auToRender(positionAU: Vector3): Vector3;   // Multiply each component by renderUnitsPerAU
  renderToAU(positionRender: Vector3): Vector3; // Divide each component by renderUnitsPerAU
}

export function createScaleTransform(renderUnitsPerAU: number): ScaleTransform;
```

**Ownership**: `ScaleTransform` is constructed by the demo/renderer setup and passed to
`ThreeDemoRenderer`. It is never held or used by `SimulationSystem` or `orbit-solver.ts`.

---

## OrbitalElements (NEW — solver-internal type)

Internal type used by `orbital-elements.ts`. Not exported from the public engine surface.

```typescript
// Internal to src/core/simulation/orbital-elements.ts
interface OrbitalElements {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationRad: number;
  longitudeAscendingNodeRad: number;
  argumentPeriapsisRad: number;
  meanAnomalyEpochRad: number;
}
```

**Key solver functions** (exported from `orbital-elements.ts`):
```typescript
export function solveEccentricAnomaly(M: number, e: number): number;
export function eccentricToTrueAnomaly(E: number, e: number): number;
export function keplerianToCartesian(
  elements: OrbitalElements,
  simTimeDays: number
): Vector3; // Returns position in AU
```

---

## Relationships

```
SceneConfiguration
  ├── ScaleProfile (extended: +renderUnitsPerAU)
  ├── TimeScaleConfig (new, optional)
  └── CelestialBodyDefinition[] (1..*)
       ├── OrbitProfile (union: circular | elliptical | keplerian)
       │    └── KeplerianOrbitProfile (new discriminant variant)
       └── AxialRotation (new, optional; used when orbit is keplerian)

SimulationSystem (runtime)
  ├── simTimeDays: number  (accumulated from TimeContext.deltaSeconds × simDaysPerRealSecond)
  └── SimulationSnapshot
       ├── bodyPositions: Record<bodyId, Vector3>    (circular/elliptical bodies, render-units)
       ├── bodyStates: Record<bodyId, SimBodyState>  (Keplerian bodies, AU-space)
       └── simulatedDays: number

ScaleTransform (renderer-owned utility)
  └── converts SimBodyState.positionAU → Three.js world position
       using ScaleProfile.renderUnitsPerAU (default 100)
```

---

## State Transitions

### Simulation Time Accumulation

```
initialized  → advancing : first TimeContext sample after loadScene()
advancing    → advancing : simTimeDays += deltaSeconds × simDaysPerRealSecond  (each tick)
rate-changed → advancing : simDaysPerRealSecond updated; simTimeDays unchanged (no discontinuity)
```

### Per-Body State (Keplerian)

```
for each Keplerian body each tick:
  M(T)  = meanAnomalyEpochRad + 2π × simTimeDays / orbitalPeriodDays
  E     = solveEccentricAnomaly(M, eccentricity)       // Newton-Raphson
  ν     = eccentricToTrueAnomaly(E, eccentricity)      // true anomaly
  pos   = keplerianToCartesian(elements, simTimeDays)  // in AU, XZ ecliptic plane
  θ     = initialPhaseRad + 2π × simTimeDays / siderealPeriodDays
  bodyStates[id] = { positionAU: pos, rotationAngle: θ, rotationAxis: axis }
```
