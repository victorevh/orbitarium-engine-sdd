# Tasks: Realistic Solar System Simulation

**Input**: Design documents from `specs/003-realistic-solar-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Physics tests are MANDATORY (TDD — failing tests must be committed before
any implementation). Tests must be written and confirmed failing before the corresponding
implementation task begins.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies within the same phase)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in task descriptions

---

## Phase 1: Setup

**Purpose**: Baseline verification before any changes.

- [x] T001 Run `npm test` and confirm all existing tests pass before any changes to `src/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and schema extensions that all user stories depend on.

**⚠️ CRITICAL**: All user story implementation tasks depend on this phase completing first.

- [x] T002 Add new TypeScript types to `src/core/models.ts`: extend `OrbitModel` union with `"keplerian"`, add `KeplerianOrbitProfile` interface, add `AxialRotation` interface, add `TimeScaleConfig` interface, add `SimBodyState` interface; extend `SimulationSnapshot` with `bodyStates: Record<string, SimBodyState>` and `simulatedDays: number`; extend `ScaleProfile` with `renderUnitsPerAU?: number`; extend `SceneConfiguration` with `timeScale?: TimeScaleConfig`; extend `CelestialBodyDefinition` with `axialRotation?: AxialRotation`

- [x] T003 Extend Zod schema in `src/config/schema/scene-schema.ts`: add `keplerian` discriminant variant to orbit schema (requires `semiMajorAxisAU > 0`, `eccentricity` in `[0, 1)`, all six angle fields as finite numbers, `centerBodyId` non-empty); add optional `axialRotation` sub-schema (`siderealPeriodDays > 0`, `axialTiltDeg` in `[0, 180]`, optional `initialPhaseDeg`); add optional `renderUnitsPerAU: z.number().positive()` to scale profile schema; add optional `timeScale` object schema (`simDaysPerRealSecond > 0`) to scene schema

- [x] T004 Create canonical solar system fixture at `specs/samples/solar-system.json` with `"coordinateSystem": "right-handed"`, `"scaleProfile": { "minZoom": 1, "maxZoom": 10000, "renderUnitsPerAU": 100 }`, `"timeScale": { "simDaysPerRealSecond": 1 }`, and bodies: Sun (circular/root, radius 0), Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune — each with J2000 Keplerian elements (`semiMajorAxisAU`, `eccentricity`, `inclinationDeg`, `longitudeAscendingNodeDeg`, `argumentPeriapsisDeg`, `meanAnomalyEpochDeg`) and `axialRotation` (`siderealPeriodDays`, `axialTiltDeg`); include one light sourced from the Sun

**Checkpoint**: `npm run validate:scene -- specs/samples/solar-system.json` must exit 0.

---

## Phase 3: User Story 1 — Solar System in Motion (Priority: P1) 🎯 MVP

**Goal**: Planets orbit the Sun along correct Keplerian ellipses, rotate on their tilted
axes, and the scene renders stably for any simulation duration.

**Independent Test**: Load solar-system.json, advance 365 simulated days at 1 day/sec,
confirm Earth has returned to approximately its starting position (±5%).

### Tests for User Story 1 ⚠️ Write these FIRST — they must FAIL before implementation

- [x] T005 [P] [US1] Write failing unit tests in `tests/unit/orbital-elements.unit.test.ts`: test `solveEccentricAnomaly(M, e)` converges for e=0, e=0.0167 (Earth), e=0.2056 (Mercury); test `eccentricToTrueAnomaly(E, e)` at E=0, E=π; test `keplerianToCartesian` for Earth at T=0 days (epoch position), T=182.6 days (half orbit, verify x-flip), T=365.25 days (full orbit, ≈ epoch position ±5%); test i=90° inclination produces Y-axis displacement; test e=0 produces circular path (distance constant)

- [x] T006 [P] [US1] Write failing unit tests in `tests/unit/scale-mapping.unit.test.ts`: test `createScaleTransform(100)` returns object with `auToRender` and `renderToAU`; test `auToRender({x:1, y:0, z:0})` returns `{x:100, y:0, z:0}`; test `renderToAU({x:100, y:0, z:0})` returns `{x:1, y:0, z:0}`; test round-trip auToRender→renderToAU identity; test `createScaleTransform(50)` scales by 50

- [x] T007 [P] [US1] Write failing unit tests in `tests/unit/rotation-solver.unit.test.ts`: test `solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0 }, 0)` returns `{ angle: 0, axis: {x:0,y:1,z:0} }`; test `solveRotation({ siderealPeriodDays: 1, axialTiltDeg: 0 }, 1)` returns angle ≈ 2π; test `solveRotation({ siderealPeriodDays: 0.997, axialTiltDeg: 23.44 }, 0)` returns axis ≈ `{x: sin(23.44°), y: cos(23.44°), z: 0}`; test `initialPhaseDeg: 90` shifts angle by π/2 at T=0

- [x] T008 [P] [US1] Write failing unit tests in `tests/unit/time-scale.unit.test.ts`: test `TimeScale` initializes with `simTimeDays = 0`; test `advance(delta=1, rate=1)` produces `simTimeDays = 1`; test `advance(delta=1, rate=365.25)` produces `simTimeDays = 365.25`; test `advance(delta=0.016, rate=1)` accumulates correctly over 100 ticks; test `getSimTimeDays()` returns current accumulated value; test initial `simDaysPerRealSecond` from config is applied on first advance

- [x] T009 [US1] Write failing integration test in `tests/integration/solar-system-sim.integration.test.ts` using a `TestTimeSource` fixture: load solar-system.json, advance 365 ticks of 1-second delta at `simDaysPerRealSecond=1`, assert Earth's final `bodyStates["earth"].positionAU` distance from Sun is within 10% of 1.0 AU; assert all 8 planet positions are finite (no NaN); assert `simulatedDays ≈ 365`

### Implementation for User Story 1

- [x] T010 [P] [US1] Implement `src/core/simulation/orbital-elements.ts`: export `solveEccentricAnomaly(M: number, e: number): number` (Newton-Raphson, max 100 iterations, ε=1e-8); export `eccentricToTrueAnomaly(E: number, e: number): number` (using `atan2` form); export `keplerianToCartesian(elements: KeplerianOrbitProfile, simTimeDays: number): Vector3` (computes orbital period via Kepler's third law, applies full IAU perifocal-to-ecliptic rotation sequence: ω around Z, i around X, Ω around Y; returns AU-space Vector3); import only from `../types` and `../models` — no rendering imports

- [x] T011 [P] [US1] Implement `src/core/simulation/scale-mapping.ts`: export `interface ScaleTransform { auToRender(p: Vector3): Vector3; renderToAU(p: Vector3): Vector3; }`; export `createScaleTransform(renderUnitsPerAU: number): ScaleTransform` as a closure that multiplies/divides each component; no imports from simulation solvers or rendering modules

- [x] T012 [P] [US1] Implement `src/core/simulation/rotation-solver.ts`: export `solveRotation(axialRotation: AxialRotation, simTimeDays: number): { angle: number; axis: Vector3 }` where `axis = { x: sin(axialTiltDeg × π/180), y: cos(axialTiltDeg × π/180), z: 0 }` and `angle = (initialPhaseDeg ?? 0) × (π/180) + 2π × simTimeDays / siderealPeriodDays`; import only from `../models` and `../types`

- [x] T013 [P] [US1] Implement `src/core/simulation/time-scale.ts`: export `class TimeScale` with constructor `(simDaysPerRealSecond: number = 1)`; method `advance(deltaSeconds: number): void` accumulates `simTimeDays += deltaSeconds × simDaysPerRealSecond`; method `getSimTimeDays(): number`; method `setRate(simDaysPerRealSecond: number): void` (validates > 0, does NOT reset simTimeDays); no imports beyond TypeScript builtins

- [x] T014 [US1] Add `solveKeplerianPosition(body: CelestialBodyDefinition, centerPosition: Vector3, simTimeDays: number): Vector3` to `src/core/simulation/orbit-solver.ts` using `keplerianToCartesian` from `orbital-elements.ts`; add centerPosition offset to returned AU-space Vector3; existing `solveBodyPosition()` function and its circular/elliptical paths are NOT modified

- [x] T015 [US1] Update `src/core/simulation/simulation-system.ts`: add `private timeScale: TimeScale` initialized from `scene.timeScale?.simDaysPerRealSecond ?? 1`; in `update(time: TimeContext)` call `timeScale.advance(time.deltaSeconds)` first; for each body with `orbit.model === "keplerian"`, call `solveKeplerianPosition` and `solveRotation`, populate `bodyStates[id]`; for circular/elliptical bodies, continue calling existing `solveBodyPosition` and populate `bodyPositions[id]`; initialize snapshot as `{ bodyPositions: {}, bodyStates: {}, simulatedDays: 0 }`; expose `setTimeScale(rate: number): void` delegating to `timeScale.setRate(rate)` 

- [x] T016 [US1] Update `apps/demo/three-demo-renderer.ts`: add `scaleTransform: ScaleTransform` constructor parameter (after existing params); in the per-frame mesh position update, check if `simulation.bodyStates[body.bodyId]` exists — if so, use `scaleTransform.auToRender(bodyStates[id].positionAU)` for position and apply `bodyStates[id].rotationAxis` / `bodyStates[id].rotationAngle` as a quaternion (`setFromAxisAngle`) to the mesh; for bodies in `bodyPositions`, continue using direct position (unchanged path)

- [x] T017 [US1] Update `apps/demo/main.ts`: import `solar-system.json` from `../../specs/samples/solar-system.json`; import `createScaleTransform` from `../../src/core/simulation/scale-mapping`; create `scaleTransform = createScaleTransform(scene.scaleProfile.renderUnitsPerAU ?? 100)`; pass `scaleTransform` to `ThreeDemoRenderer` constructor; load solar system scene via `engine.loadScene(solarSystemScene)` in addition to or replacing the existing demo scene

**Checkpoint**: `npm run demo` opens a browser showing all 8 planets orbiting the Sun with visible axial tilt. Earth completes one orbit in ~365 real seconds.

---

## Phase 4: User Story 2 — Configuration-Driven Body Definition (Priority: P2)

**Goal**: Any Keplerian body added to the JSON config orbits correctly on first run.
Invalid configs are rejected before simulation starts.

**Independent Test**: Add a 9th body (e.g., a hypothetical planet at a=20 AU, e=0.1) to
`solar-system.json`, restart the demo, confirm it orbits correctly with no code changes.

### Tests for User Story 2 ⚠️ Write FIRST — must FAIL before implementation

- [x] T018 [P] [US2] Add Keplerian validation cases to `tests/contract/scene-validation.contract.test.ts`: assert valid Keplerian body (Earth elements) is accepted; assert `eccentricity: 1.0` produces validation error at path `$.bodies[N].orbit.eccentricity`; assert `eccentricity: -0.1` is rejected; assert missing `semiMajorAxisAU` on a `model:"keplerian"` orbit is rejected; assert `axialTiltDeg: 200` is rejected; assert `siderealPeriodDays: -1` is rejected; assert optional `axialRotation` absent on a Keplerian body is accepted

- [x] T019 [US2] Write failing integration test in `tests/integration/simulation-layer-isolation.integration.test.ts` that reads the source of `src/core/simulation/simulation-system.ts`, `src/core/simulation/orbit-solver.ts`, `src/core/simulation/orbital-elements.ts`, `src/core/simulation/rotation-solver.ts`, `src/core/simulation/time-scale.ts` using `fs.readFileSync` and asserts none of them contain the string `"scale-mapping"` or `"ScaleTransform"` or `"Date.now"` or `"performance.now"`

### Implementation for User Story 2

- [x] T020 [US2] Confirm `scene-validation.contract.test.ts` tests pass after T002/T003 schema changes; if any Keplerian validation case fails, fix the Zod refinement in `src/config/schema/scene-schema.ts` until all T018 tests pass

- [x] T021 [US2] Confirm `simulation-layer-isolation.integration.test.ts` passes after US1 implementation; if any violation found (scale-mapping or Date.now in simulation files), remove the violation from the offending file in `src/core/simulation/`

**Checkpoint**: `npm run validate:scene -- specs/samples/solar-system.json` exits 0. Adding a new Keplerian body to the JSON config with valid elements produces correct orbital motion on reload.

---

## Phase 5: User Story 3 — Time Scale Control (Priority: P3)

**Goal**: Simulation time scale can be changed at runtime with no positional discontinuity
and no numerical instability at extreme rates.

**Independent Test**: With demo running, press `+` to double time scale, press `-` to
halve it, press `0` to reset; confirm all orbital motion remains smooth with no jump.

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before implementation

- [x] T022 [P] [US3] Add rate-change tests to `tests/unit/time-scale.unit.test.ts`: test `setRate(365.25)` after `advance(1, 1)` changes future accumulation without resetting `simTimeDays`; test `setRate(0.001)` followed by `advance(1, ...)` accumulates only 0.001 simulated days; test that `simTimeDays` is identical before and immediately after `setRate(...)` (no discontinuity); test `setRate(0)` throws or is rejected with a validation error; test `setRate(-1)` throws or is rejected

### Implementation for User Story 3

- [x] T023 [US3] Verify `SimulationSystem.setTimeScale(rate: number)` from T015 validates `rate > 0` (throws `RangeError` for `rate ≤ 0`) and delegates to `TimeScale.setRate(rate)` without modifying `simTimeDays`

- [x] T024 [US3] Add `setTimeScale(simDaysPerRealSecond: number): void` to `EngineHandle` in `src/core/engine/engine-handle.ts` that calls `this.simulationSystem.setTimeScale(simDaysPerRealSecond)`; also update `src/core/engine/system-ports.ts` `SimulationSystem` interface if `setTimeScale` needs to be on the port

- [x] T025 [US3] Add keyboard time scale controls to `apps/demo/main.ts`: key `=`/`+` doubles `simDaysPerRealSecond` (up to max 365250); key `-` halves it (down to min 0.001); key `0` resets to `1.0`; call `engine.setTimeScale(newRate)` on each change; display current rate in the demo UI status line

**Checkpoint**: Pressing `+` in the demo accelerates orbital motion; pressing `-` slows it; pressing `0` resets to 1 day/sec. No visual jump occurs when rate changes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Stability testing, public API surface, and full regression.

- [x] T026 [P] Add long-run stability integration test to `tests/integration/solar-system-sim.integration.test.ts`: advance simulation at `simDaysPerRealSecond=365250` (1000 years per real second) for 10 real seconds (= 10 000 simulated years) using 60-fps ticks; assert all 8 planet `bodyStates` positions are finite (no NaN, no Infinity) after the run

- [x] T027 [P] Update `src/index.ts` to export `KeplerianOrbitProfile`, `AxialRotation`, `TimeScaleConfig`, `SimBodyState` from the public engine surface alongside existing exports

- [x] T028 Run `npm test` and confirm ALL tests pass (unit, integration, contract)

- [x] T029 Run `npm run demo` and verify all items on the manual acceptance checklist in `specs/003-realistic-solar-system/quickstart.md` section 5

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 baseline passing.
- **US1 (Phase 3)**: Depends on Foundational (T002–T004) completing.
  Tests T005–T009 can be written in parallel immediately after T002.
  Implementations T010–T013 can be written in parallel after tests are committed failing.
  T014 depends on T010. T015 depends on T012, T013, T014. T016 depends on T011, T015. T017 depends on T004, T011, T016.
- **US2 (Phase 4)**: Tests T018–T019 can be written in parallel after T002 (schema visible).
  T020 depends on T003, T018. T021 depends on T015, T019.
- **US3 (Phase 5)**: Test T022 can be written in parallel with US2.
  T023 depends on T015. T024 depends on T023. T025 depends on T024.
- **Polish (Phase 6)**: T026 depends on T015. T027 depends on T002. T028 depends on all prior tasks. T029 depends on T028.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only. Delivers the full orbital simulation MVP.
- **US2 (P2)**: Depends on US1 completing (simulation must work to validate config-driven
  body addition). Validation schema changes are Foundational.
- **US3 (P3)**: Depends on US1 (SimulationSystem must exist). Independently testable from US2.

---

## Parallel Opportunities

### During Foundational Phase

T002, T003, T004 are sequential (T003 depends on types from T002; T004 uses schema from T003).

### Once T002 is complete — launch in parallel

```
Task: Write failing tests for orbital-elements     → tests/unit/orbital-elements.unit.test.ts
Task: Write failing tests for scale-mapping        → tests/unit/scale-mapping.unit.test.ts
Task: Write failing tests for rotation-solver      → tests/unit/rotation-solver.unit.test.ts
Task: Write failing tests for time-scale           → tests/unit/time-scale.unit.test.ts
Task: Write failing Keplerian contract tests       → tests/contract/scene-validation.contract.test.ts
Task: Write failing layer isolation test           → tests/integration/simulation-layer-isolation.integration.test.ts
```

### Once tests are committed failing — launch implementations in parallel

```
Task: Implement orbital-elements.ts   → src/core/simulation/orbital-elements.ts
Task: Implement scale-mapping.ts      → src/core/simulation/scale-mapping.ts
Task: Implement rotation-solver.ts    → src/core/simulation/rotation-solver.ts
Task: Implement time-scale.ts         → src/core/simulation/time-scale.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: baseline check
2. Complete Phase 2: Foundational (T002–T004)
3. Write all US1 failing tests (T005–T009)
4. Implement US1 physics modules in parallel (T010–T013)
5. Wire orbit-solver and simulation-system (T014–T015)
6. Update renderer and demo (T016–T017)
7. **STOP and VALIDATE**: `npm run demo` — planets orbit the Sun

### Incremental Delivery

1. MVP (US1) → solar system is live in the demo
2. US2 → confirm configuration-driven extensibility works; schema rejects bad configs
3. US3 → runtime time scale controls work in the demo
4. Polish → long-run stability confirmed, public API exported

---

## Notes

- `[P]` tasks touch different files and have no dependencies on incomplete tasks in the same phase — they can run in parallel
- All tests marked with ⚠️ MUST be committed in a failing state before the corresponding implementation starts
- Verify tests fail with a meaningful assertion error (not a compile error) before proceeding
- After each phase checkpoint, run `npm test` to confirm no regressions
- Never import `scale-mapping.ts` or `ScaleTransform` from any file under `src/core/simulation/`
- Never call `Date.now()` or `performance.now()` from any file under `src/core/simulation/`
