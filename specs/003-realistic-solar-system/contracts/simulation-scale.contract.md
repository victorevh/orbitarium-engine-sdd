# Contract: Simulation Scale and Snapshot Behavior

**Date**: 2026-04-30
**Spec**: [../spec.md](../spec.md)
**Research**: [../research.md](../research.md)

## Purpose

Define how simulated time is accumulated, how Keplerian body positions are computed and
stored in simulation space (AU), and how the renderer applies `ScaleTransform` to convert
simulation coordinates to render coordinates. This contract also defines the
`SimulationSnapshot` shape and partitioning rules.

---

## Inputs

- `SceneConfiguration.scaleProfile.renderUnitsPerAU` (default 100)
- `SceneConfiguration.timeScale.simDaysPerRealSecond` (default 1)
- Validated Keplerian orbital elements and axial rotation profiles per body
- `TimeContext.deltaSeconds` from the configured `TimeSource`

---

## Time Accumulation

```
simTimeDays += TimeContext.deltaSeconds × simDaysPerRealSecond
```

**Rules**:
- `deltaSeconds` MUST come exclusively from `TimeSource`-derived `TimeContext`.
  No direct `Date.now()` or `performance.now()` calls are permitted in simulation code.
- `simDaysPerRealSecond` MUST be positive.
- `simTimeDays` is monotonically increasing; it MUST NOT be reset between ticks.
- Time scale changes (via `SimulationSystem.setTimeScale()`) MUST take effect from the
  next tick without modifying `simTimeDays`.
- `simTimeDays` MUST be the same for a given `TimeContext` sequence regardless of the
  value of `simDaysPerRealSecond` history; changing rate affects only future accumulation.

---

## Keplerian Position Computation (per body per tick)

```
orbitalPeriodDays = 365.25 × semiMajorAxisAU^1.5         // Kepler's third law
M = meanAnomalyEpochRad + 2π × simTimeDays / orbitalPeriodDays
E = solveEccentricAnomaly(M, eccentricity)                 // Newton-Raphson, ε < 1e-8
ν = eccentricToTrueAnomaly(E, eccentricity)
r = semiMajorAxisAU × (1 - eccentricity × cos(E))         // orbital radius in AU
positionAU = applyOrbitalRotations(r, ν, i, Ω, ω)        // IAU perifocal → ecliptic
```

**Rules**:
- Position MUST be finite (no NaN, no Infinity) for any valid orbital parameters.
- Position MUST be deterministic: the same `simTimeDays` and same elements MUST produce
  the same `positionAU` on every call.
- Solver MUST converge within 100 Newton-Raphson iterations; if convergence fails (e ≥ 1),
  the configuration is invalid and MUST be caught during schema validation.
- Center body position MUST be resolved from `bodyStates` or `initialPosition` in body
  definition order (bodies appearing earlier in the array are solved first).

---

## Axial Rotation Computation (per body per tick)

```
rotationAxis  = Vector3(sin(axialTiltDeg × π/180), cos(axialTiltDeg × π/180), 0)
rotationAngle = (initialPhaseDeg ?? 0) × (π/180) + 2π × simTimeDays / siderealPeriodDays
```

**Rules**:
- `rotationAxis` MUST be normalized (unit vector).
- `rotationAngle` increases monotonically with `simTimeDays`.
- For bodies without `axialRotation`, `rotationAngle = 0` and
  `rotationAxis = Vector3(0, 1, 0)`.

---

## SimulationSnapshot Shape and Partitioning

```typescript
interface SimulationSnapshot {
  bodyPositions: Record<string, Vector3>;       // circular/elliptical bodies only
  bodyStates:    Record<string, SimBodyState>;  // Keplerian bodies only (AU-space)
  simulatedDays: number;                        // total elapsed simulated days
}

interface SimBodyState {
  positionAU:    Vector3;  // heliocentric position in Astronomical Units
  rotationAngle: number;   // spin angle in radians
  rotationAxis:  Vector3;  // normalized spin axis (ecliptic frame)
}
```

**Partitioning rule**: Each `bodyId` appears in EXACTLY ONE of `bodyPositions` or
`bodyStates`. A body MUST NOT appear in both maps in the same snapshot.

**Invariants**:
- All values in `bodyStates[id].positionAU` MUST be finite.
- `simulatedDays` MUST be finite and non-negative.
- `bodyStates` for Keplerian bodies is populated every tick after `loadScene()`.
- `bodyPositions` for circular/elliptical bodies is populated every tick (unchanged
  from pre-feature behavior).

---

## Scale Transform (renderer-owned)

`ScaleTransform` is a pure utility instantiated by the rendering setup, never by
`SimulationSystem`.

```
renderPosition = positionAU × renderUnitsPerAU
```

**Rules**:
- `ScaleTransform` MUST NOT be imported or used by `SimulationSystem` or any simulation
  solver (`orbit-solver.ts`, `rotation-solver.ts`, `orbital-elements.ts`).
- `renderUnitsPerAU` is read once from `scaleProfile` at renderer initialization time.
- Scale conversion MUST NOT alter the values stored in `SimulationSnapshot`.
- `ThreeDemoRenderer` MUST call `scaleTransform.auToRender(bodyStates[id].positionAU)`
  for Keplerian bodies and MUST use `bodyPositions[id]` directly for circular/elliptical
  bodies.

---

## Acceptance Criteria

- No `Date.now()` or `performance.now()` call appears in any file under
  `src/core/simulation/`.
- Identical `TimeContext` sequences produce identical `SimulationSnapshot` values.
- Earth (`semiMajorAxisAU = 1.0`, `eccentricity = 0.0167`) completes one full orbit
  within ±5% of 365.25 simulated days as measured by position returning to its epoch
  location.
- After 1 000 Earth orbits simulated at 1000× real-time, all `bodyStates` values remain
  finite.
- `ScaleTransform` is absent from all files under `src/core/simulation/`.
- The `bodyStates` map for a scene using only circular/elliptical orbits is empty (`{}`).
- The `bodyPositions` map for a scene using only Keplerian orbits is empty (`{}`).
