# Implementation Plan: Realistic Solar System Simulation

**Branch**: `003-realistic-solar-system` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-realistic-solar-system/spec.md`

## Summary

Extend the existing deterministic Orbitarium engine from simplified constant-angular-velocity
orbits to a full Keplerian mechanics model capable of representing the solar system. The
implementation adds: an AU-based simulation coordinate system alongside a render-unit scale
layer (`ScaleTransform`); a `TimeScale` wrapper over `TimeSource` that maps real seconds to
simulated days; a Kepler equation solver (Newton-Raphson) computing heliocentric body positions
from six orbital elements; a `RotationSolver` parameterized by sidereal period and axial tilt;
and an extended `SimulationSnapshot` carrying AU-space body states consumed read-only by the
renderer. All new physics logic is built test-first. The existing `EngineHandle`,
`NavigationController`, and circular/elliptical orbit paths are not modified.

## Technical Context

**Language/Version**: TypeScript 5.6, ES2022 module target, browser runtime with WebGL2
**Primary Dependencies**: Three.js ^0.176.0, Zod ^3.23.8, Vitest ^2.1.3
**Storage**: N/A for simulation state; static JSON scene configuration
**Testing**: Vitest — unit (orbital math, scale conversion, time scale), integration
(orbital period correctness, long-run stability, headless isolation), contract
(Keplerian schema validation)
**Target Platform**: Desktop-class WebGL2 browsers (Vite dev server for demo)
**Project Type**: Reusable frontend engine/library with Vite demo app
**Performance Goals**: 60 fps for a complete solar-system scene; deterministic simulation under
1000× time acceleration; no positional drift or NaN after 1 simulated solar year
**Constraints**: TimeSource remains the only time input; simulation layer runs headless with no
rendering context; NavigationController is not modified; existing scene configs remain valid
with zero changes
**Scale/Scope**: Sun + 8 planets + selected moons; Keplerian orbits; axial tilt/rotation;
configurable time scale; default 1 AU = 100 render units

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1 – Simulation Determinism**: PASS. All simulation time derives exclusively from
  `TimeContext` produced by `TimeSource`. Orbital positions are pure functions of
  `simTimeDays` (accumulated from `deltaSeconds`); no wall-clock access introduced.

- **Gate 2 – Numerical Stability**: PASS. Positions stored in AU (JS float64). Kepler
  equation solved via Newton-Raphson per tick from total elapsed time (not step-accumulated),
  eliminating long-chain cancellation. The 0.3–30 AU range is well within float64 precision;
  no visible drift at 100 render units/AU.

- **Gate 3 – Simulation/Rendering Layer Separation**: PASS. `SimulationSnapshot.bodyStates`
  carries only AU-space positions and rotation angles for Keplerian bodies. `ScaleTransform`
  is owned by the renderer (instantiated in demo `main.ts`), not by `SimulationSystem`.
  No rendering types appear in simulation code; no simulation math appears in render-pipeline
  code. Note: legacy `bodyPositions` for circular/elliptical bodies retains existing
  mixed-unit semantics as documented technical debt.

- **Gate 4 – TDD for Core Physics**: PASS. `orbital-elements.ts`, `scale-mapping.ts`,
  `rotation-solver.ts`, and `time-scale.ts` are written test-first; failing unit tests are
  committed before any implementation. All physics tests run headlessly in Vitest (Node
  environment, no DOM, no GPU).

- **Gate 5 – Rendering Performance Budget**: PASS. Scale conversion is O(n) for n bodies
  per frame (n ≤ ~15 for a solar system scene). No GPU or CPU render budget impact beyond
  trivial float multiplications.

- **Gate 6 – Modularity**: PASS. All new simulation code lives in `src/core/simulation/`.
  `EngineHandle` is not modified. `NavigationController` is not modified. Schema extensions
  use fully optional fields with defaults. `ScaleTransform` lives in simulation module
  but is renderer-owned at runtime.

- **Gate 7 – No Hidden Behavior**: PASS. Orbital motion is driven entirely by Keplerian
  parameters in the scene configuration. No implicit forces, attractors, magic constants,
  or auto-correction behaviors.

Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-realistic-solar-system/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── solar-system-config.contract.md
│   └── simulation-scale.contract.md
└── tasks.md             ← /speckit-tasks output (not created here)
```

### Source Code

```text
src/
├── config/
│   └── schema/
│       └── scene-schema.ts              ← MODIFY: add keplerian orbit schema variant,
│                                                    axialRotation, timeScale, renderUnitsPerAU
├── core/
│   ├── models.ts                        ← MODIFY: add KeplerianOrbitProfile, AxialRotation,
│   │                                               TimeScaleConfig, SimBodyState;
│   │                                               extend SimulationSnapshot, ScaleProfile,
│   │                                               SceneConfiguration, OrbitModel
│   └── simulation/
│       ├── orbital-elements.ts          ← NEW: Kepler element types + Newton-Raphson solver
│       ├── orbit-solver.ts              ← MODIFY: add keplerian solve path; circular/elliptical
│       │                                          paths unchanged
│       ├── scale-mapping.ts             ← NEW: ScaleTransform (AU ↔ render units)
│       ├── rotation-solver.ts           ← NEW: axial tilt + sidereal rotation solver
│       ├── simulation-system.ts         ← MODIFY: integrate new solvers, accumulate simTimeDays,
│       │                                          return extended SimulationSnapshot
│       └── time-scale.ts               ← NEW: TimeScale wrapper (simDaysPerRealSecond)
└── rendering/
    └── renderer.ts                      ← UNCHANGED

apps/
└── demo/
    ├── main.ts                          ← MODIFY: load solar system scene config,
    │                                               pass ScaleTransform to renderer
    └── three-demo-renderer.ts           ← MODIFY: use ScaleTransform + bodyStates for
                                                    Keplerian bodies; apply axial tilt/rotation

tests/
├── unit/
│   ├── orbital-elements.unit.test.ts    ← NEW (TDD-first: write failing tests first)
│   ├── scale-mapping.unit.test.ts       ← NEW (TDD-first)
│   ├── rotation-solver.unit.test.ts     ← NEW (TDD-first)
│   └── time-scale.unit.test.ts          ← NEW (TDD-first)
├── integration/
│   ├── solar-system-sim.integration.test.ts          ← NEW: period correctness, stability
│   └── simulation-layer-isolation.integration.test.ts ← NEW: headless execution validation
└── contract/
    └── scene-validation.contract.test.ts ← MODIFY: add keplerian schema validation cases

specs/samples/
└── solar-system.json                    ← NEW: canonical solar system fixture (Sun + 8 planets)
```

**Structure Decision**: Single-package library layout. All new simulation modules extend
`src/core/simulation/`. No new top-level packages. Demo is updated to load the solar system
scene and demonstrate time scaling.

## Architecture Boundaries

- **`EngineHandle`**: not modified. Continues to call `simulationSystem.update(time)` and
  pass `SimulationSnapshot` to the renderer unchanged.

- **`SimulationSystem`**: accumulates `simTimeDays` using `TimeScale`; delegates per-body
  position solving to `orbit-solver.ts` (Keplerian path for `model: "keplerian"`, unchanged
  existing paths for `"circular"` and `"elliptical"`); delegates rotation to
  `rotation-solver.ts`; produces `SimulationSnapshot` with `bodyStates` (AU-space, Keplerian
  only) and the existing `bodyPositions` (for circular/elliptical bodies, unchanged).

- **`orbit-solver.ts`**: extended with a Keplerian solve path that returns AU-space Vector3
  via `solveKeplerianPosition()`. Existing `solveBodyPosition()` for circular/elliptical is
  not modified and continues to populate `bodyPositions`.

- **`ScaleTransform`** (`scale-mapping.ts`): owned and instantiated by the rendering setup
  (`apps/demo/main.ts`). Passed into `ThreeDemoRenderer` at construction time. Converts
  `bodyStates[id].positionAU` → Three.js world position per frame. Not used by
  `SimulationSystem`.

- **`ThreeDemoRenderer`**: updated to accept `ScaleTransform` at construction. Per-frame
  rendering checks `simulation.bodyStates[id]` for Keplerian bodies (applies ScaleTransform)
  and `simulation.bodyPositions[id]` for legacy bodies (direct placement, unchanged).
  Applies axial tilt quaternion to body meshes using `bodyStates[id].rotationAxis` and
  `bodyStates[id].rotationAngle`.

- **`SceneConfiguration`**: extended with optional `timeScale?: TimeScaleConfig` and
  `scaleProfile.renderUnitsPerAU?: number`. Both default gracefully (1 day/sec, 100 units/AU).
  Existing scenes without these fields remain valid.

## Deferred Work

- Full n-body gravitational integration.
- Live NASA/JPL ephemeris import or network synchronization.
- Relativistic corrections and high-precision astronomy.
- Procedural planet terrain, atmosphere simulation.
- Streaming texture asset pipeline.
- Per-body time scale overrides.
- Camera orbital-mode integration with Keplerian body positions.
- Unified simulation/render unit system (migrating circular/elliptical bodies to AU units).

## Complexity Tracking

No constitutional violations require justification. The mixed-unit `bodyPositions` legacy
behavior is documented as technical debt in research.md Decision 7, with a clear migration
path via the new `bodyStates` field.
