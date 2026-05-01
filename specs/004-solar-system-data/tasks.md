# Tasks: Full Solar System Dataset

**Input**: Design documents from `specs/004-solar-system-data/`
**Prerequisites**: `specs/004-solar-system-data/plan.md`, `specs/004-solar-system-data/spec.md`
**Tests**: Mandatory. This feature uses TDD, so all test tasks below must be written and failing before the matching implementation tasks.

## Format

`- [ ] T001 [P] [US1] Description with exact file path`

- `[P]` means the task can run in parallel with other `[P]` tasks in the same phase.
- `[US1]`, `[US2]`, etc. map to the user stories in `spec.md`.

---

## Phase 1: Setup and Baseline

**Purpose**: Verify the existing 003 foundation is stable before adding the full solar-system dataset.

- [x] T001 Verify the 003 regression suite still passes by running `npm test` against `specs/003-realistic-solar-system/tasks.md`.
- [x] T002 Verify the current demo can still load `specs/samples/solar-system.json` from `apps/demo/main.ts` and render the 003 scene without errors.

**Checkpoint**: The current engine and demo remain healthy before any 004 changes begin.

---

## Phase 2: Foundational Data and Validation

**Purpose**: Define the complete 10-body dataset and the schema rules that every story depends on.

**Independent Test**: `npm run validate:scene -- specs/samples/solar-system-complete.json` exits successfully and rejects invalid body metadata before scene initialization.

- [x] T003 [P] Create `specs/samples/solar-system-complete.json` with the Sun, all 8 planets, Earth's Moon, `scaleProfile`, `timeScale`, and `sourceMetadata`.
- [x] T004 [P] Add `specs/004-solar-system-data/NASA-JPL-REFERENCES.md` documenting the source for each body's orbital and rotational parameters.
- [x] T005 Extend `src/config/schema/scene-schema.ts` to support the `moon` body type and the optional `sourceMetadata` object.
- [x] T006 Add moon parent-body validation in `src/config/schema/scene-schema.ts` so any `moon` must define `centerBodyId` and reference a planet.
- [x] T007 Update `specs/004-solar-system-data/contracts/solar-system-config.contract.md` so the JSON scene contract reflects the final 10-body dataset, moon rules, and strict rejection behavior.

**Checkpoint**: The complete solar-system scene can be validated as configuration, and invalid moon or orbit definitions fail fast.

---

## Phase 3: User Story 1 - Load and Visualize Complete Solar System (Priority: P1)

**Goal**: Load the complete solar-system scene, compute body positions correctly, and render the Sun, 8 planets, and Earth's Moon.

**Independent Test**: Load `specs/samples/solar-system-complete.json`, confirm exactly 10 bodies are present, and verify Earth and the Moon complete the expected number of orbits over 1 simulated year.

### Tests for User Story 1 - write first and expect failures

- [x] T008 [P] [US1] Add unit coverage in `tests/unit/moon-orbital-mechanics.unit.test.ts` for parsing the Moon body, its `centerBodyId`, and key orbital positions across a lunar month.
- [x] T009 [P] [US1] Add integration coverage in `tests/integration/complete-solar-system.integration.test.ts` for loading `specs/samples/solar-system-complete.json`, verifying 10 bodies, and checking finite body states after a simulated year.
- [x] T010 [P] [US1] Add integration coverage in `tests/integration/solar-system-moon-cycles.integration.test.ts` for apogee/perigee timing and Moon orbital stability over repeated cycles.
- [x] T011 [P] [US1] Add integration coverage in `tests/integration/solar-system-scene-load.integration.test.ts` for `EngineHandle.loadScene(config)` and the presence of `bodyStates` for all 10 bodies.

### Implementation for User Story 1

- [x] T012 Update `src/core/simulation/orbit-solver.ts` so Keplerian position solving can resolve a non-solar center body such as Earth for the Moon.
- [x] T013 Update `src/core/simulation/simulation-system.ts` to process bodies in dependency order and populate `bodyStates` for planets and moons.
- [x] T014 Update `apps/demo/main.ts` to load `specs/samples/solar-system-complete.json` at startup and present the full 10-body scene.
- [x] T015 Update `apps/demo/three-demo-renderer.ts` so moon bodies render distinctly and use the simulation body states for position and rotation.

**Checkpoint**: The demo shows the full solar system, and the Moon orbits Earth rather than the Sun.

---

## Phase 4: User Story 2 - Real Astronomical Parameters (Priority: P1)

**Goal**: Keep the full dataset traceable to NASA/JPL sources and accurate within the tolerances defined in the spec.

**Independent Test**: Cross-check each body's parameters against NASA/JPL reference values and confirm the source metadata is present and readable.

### Tests for User Story 2 - write first and expect failures

- [x] T016 [P] [US2] Add integration coverage in `tests/integration/nasa-jpl-parameter-verification.integration.test.ts` for semi-major axis, eccentricity, inclination, and sidereal period tolerances.
- [x] T017 [P] [US2] Add integration coverage in `tests/integration/parameter-source-traceability.integration.test.ts` for `sourceMetadata` and `specs/004-solar-system-data/NASA-JPL-REFERENCES.md` traceability.
- [x] T018 [P] [US2] Add integration coverage in `tests/integration/moon-parameter-accuracy.integration.test.ts` for Moon semi-major axis, perigee, apogee, inclination, and period accuracy.

### Implementation for User Story 2

- [x] T019 Verify and correct the orbital and rotational values in `specs/samples/solar-system-complete.json` against NASA/JPL reference data.
- [x] T020 Finalize `specs/004-solar-system-data/NASA-JPL-REFERENCES.md` and the `sourceMetadata` entries in `specs/samples/solar-system-complete.json` so the dataset is traceable.

**Checkpoint**: The complete dataset is source-traceable and within the accuracy tolerances required by the spec.

---

## Phase 5: User Story 3 - Configuration-Driven Scene (Priority: P2)

**Goal**: Support scene variants through JSON-only configuration changes with no TypeScript code edits required for new datasets.

**Independent Test**: Load a variant scene JSON file such as a no-Moon configuration and confirm the demo runs with the correct body count and validation behavior.

### Tests for User Story 3 - write first and expect failures

- [x] T021 [P] [US3] Add integration coverage in `tests/integration/config-driven-variants.integration.test.ts` for loading a no-Moon variant from `specs/samples/solar-system-no-moon.json`.
- [x] T022 [P] [US3] Add contract coverage in `tests/contract/scene-validation-moon-config.contract.test.ts` for valid and invalid moon parent references in `src/config/schema/scene-schema.ts`.
- [x] T023 [P] [US3] Add integration coverage in `tests/integration/configuration-extension.integration.test.ts` for adding custom configured bodies through JSON alone.

### Implementation for User Story 3

- [x] T024 Create `specs/samples/solar-system-no-moon.json` as a variant of the full dataset without Earth's Moon.
- [x] T025 Create `specs/samples/solar-system-custom-body.json` as a configuration extension example for additional bodies.
- [x] T026 Update `apps/demo/main.ts` to read `?scene=complete|no-moon|custom` and load the matching scene file.
- [x] T027 Tighten the moon-parent error handling in `src/config/schema/scene-schema.ts` if the validation messages need to be more explicit.

**Checkpoint**: Scene variants load from JSON only, and invalid moon parent relationships are rejected before initialization.

---

## Phase 6: User Story 4 - Accurate Scale and Proportions (Priority: P2)

**Goal**: Keep body sizes, orbital spacing, and zoom ranges visually proportional enough to support accurate solar-system exploration.

**Independent Test**: Render the full system at default and zoomed views, then compare distances and sizes against the expected scaled ratios.

### Tests for User Story 4 - write first and expect failures

- [x] T028 [P] [US4] Add integration coverage in `tests/integration/scale-proportions-verification.integration.test.ts` for render-unit distances and size ratios.
- [x] T029 [P] [US4] Add integration coverage in `tests/integration/orbital-spacing-accuracy.integration.test.ts` for the spacing between neighboring planetary orbits.
- [x] T030 [P] [US4] Add integration coverage in `tests/integration/renderer-scale-accuracy.integration.test.ts` for mesh scale behavior in the Three.js renderer.
- [x] T031 [P] [US4] Add integration coverage in `tests/integration/zoom-range-validity.integration.test.ts` for min/max zoom usability across the full system.

### Implementation for User Story 4

- [x] T032 Update `src/rendering/renderer.ts` or add `src/rendering/scale-renderer.ts` so body sizes are scaled consistently for visualization.
- [x] T033 Update `apps/demo/three-demo-renderer.ts` to apply the configured scale transform and keep zoom behavior bounded by the scene's scale profile.
- [x] T034 Update `apps/demo/main.ts` to show the current simulated date, orbit counters, and current time scale in the demo status area.

**Checkpoint**: The visual presentation remains proportional enough to inspect the solar system at both full-system and close-up zoom levels.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Final regression coverage, public API cleanup, and demo documentation.

- [x] T035 Update `src/index.ts` to export the solar-system-related public types used by the new scene data and tests.
- [x] T036 Run `npm test` and fix any regressions across the unit, contract, and integration suites.
- [x] T037 Run `npm run demo` and verify the manual checklist in `specs/004-solar-system-data/quickstart.md`.
- [x] T038 Finalize `specs/004-solar-system-data/quickstart.md` with the validation and run instructions for the complete solar-system dataset.
- [x] T039 Add or update `specs/004-solar-system-data/DEMO-QUICKSTART.md` for demo usage, scene variants, and controls.
- [x] T040 Reconcile `specs/004-solar-system-data/contracts/solar-system-config.contract.md` with the final implemented configuration shape and validation rules.

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 has no dependencies and can start immediately.
- Phase 2 depends on Phase 1 completing successfully.
- Phase 3 depends on Phase 2 because the Moon-aware dataset and schema must exist first.
- Phase 4 depends on Phase 2 and can proceed after the complete dataset exists.
- Phase 5 depends on Phase 2 and the Phase 3 scene loader changes.
- Phase 6 depends on Phase 3 because the renderer must already consume the new scene.
- Phase 7 depends on the story phases being complete.

### User Story Dependencies

- US1 is the MVP and delivers the full solar system scene.
- US2 depends on the full dataset from Phase 2 but not on the visualization refinements from US4.
- US3 depends on the scene loader path from US1 so variants can load without code changes.
- US4 depends on the renderer and simulation path from US1.

### Parallel Opportunities

- After Phase 2, T008-T011 can be written in parallel because they touch different test files.
- After Phase 2, T016-T018 can be written in parallel because they verify different parts of the same dataset.
- After Phase 2, T021-T023 can be written in parallel because they cover different variant behaviors.
- After Phase 2, T028-T031 can be written in parallel because they cover different scale and rendering checks.
- T003 and T004 can be started together because they write different documentation/data files.

### Parallel Example: User Story 1

```text
Task T008: tests/unit/moon-orbital-mechanics.unit.test.ts
Task T009: tests/integration/complete-solar-system.integration.test.ts
Task T010: tests/integration/solar-system-moon-cycles.integration.test.ts
Task T011: tests/integration/solar-system-scene-load.integration.test.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 baseline checks.
2. Complete Phase 2 data and schema foundations.
3. Write the failing US1 tests.
4. Implement US1 simulation and demo loading.
5. Stop and validate that the full 10-body system renders and the Moon orbits Earth.

### Incremental Delivery

1. Deliver US1 as the first usable MVP.
2. Add US2 accuracy verification and traceability.
3. Add US3 configuration variants without code changes.
4. Add US4 scale and zoom improvements.
5. Finish with regression and demo hardening in Phase 7.

---

## Notes

- All tasks follow the strict checklist format required by the spec workflow.
- Every story has its own independent test criteria and implementation slice.
- Tests are mandatory for this feature because the spec requires TDD for the physics and validation work.
