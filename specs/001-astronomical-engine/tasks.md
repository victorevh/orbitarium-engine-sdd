# Tasks: Modular Astronomical Exploration Engine (US1 + US2)

**Input**: Design documents from /specs/001-astronomical-engine/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because MVP requires deterministic behavior, contract compliance, and strict time-source boundaries.

**Organization**: Tasks are grouped by phases for User Story 1 (MVP baseline) and User Story 2 (spatial orientation/navigation feedback).

## Format: [ID] [P?] [Story] Description

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: User story label for story-scoped tasks
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [X] T001 Initialize Node/TypeScript package manifest and scripts in package.json
- [X] T002 Configure TypeScript compiler and module settings in tsconfig.json
- [X] T003 [P] Configure Vitest test runner in vitest.config.ts
- [X] T004 Create root engine exports in src/index.ts
- [X] T005 Create initial project structure markers in src/core/.gitkeep, src/core/time/.gitkeep, src/rendering/.gitkeep, src/config/.gitkeep, tests/unit/.gitkeep, tests/integration/.gitkeep, tests/contract/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before MVP story implementation

**CRITICAL**: User story work starts only after this phase

- [X] T006 Define shared numeric/vector/type aliases in src/core/types.ts
- [X] T007 [P] Define runtime domain models in src/core/models.ts
- [X] T008 [P] Define validation error envelope types in src/core/validation/validation-error.ts
- [X] T009 Implement scene configuration schema in src/config/schema/scene-schema.ts (including circular orbit radius policy by body type)
- [X] T010 Implement full-document validation with aggregated errors in src/core/validation/scene-validator.ts (including star root radius allowance)
- [X] T011 [P] Implement validation-result mapping utilities in src/config/transformers/validation-result-mapper.ts
- [X] T012 Define system orchestration interfaces (navigation, simulation, renderer, time) in src/core/engine/system-ports.ts
- [X] T013 Implement TimeSource and TimeContext contracts in src/core/time/time-source.ts
- [X] T014 Implement default RealTimeSource in src/core/time/real-time-source.ts
- [X] T015 [P] Implement deterministic TestTimeSource helper in tests/helpers/test-time-source.ts
- [X] T016 Implement EngineHandle lifecycle skeleton (orchestrator-only, injected TimeSource) in src/core/engine/engine-handle.ts
- [X] T017 Add deterministic fixture scene in tests/fixtures/minimal-scene.json

**Checkpoint**: Foundation ready for MVP user story

---

## Phase 3: User Story 1 - Navigate a Configured Star System (Priority: P1) MVP

**Goal**: Load one valid scene and provide stable free/orbital navigation with circular/elliptical orbit simulation and rendering.

**Independent Test**: Load a one-star, two-orbiting-body scene; validate free and orbital movement; verify stable camera and deterministic orbit updates driven by TimeSource.

### Tests for User Story 1

- [X] T018 [P] [US1] Add contract test for aggregated validation failure behavior in tests/contract/scene-validation.contract.test.ts
- [X] T019 [P] [US1] Add contract test for TimeSource injection and RealTimeSource default behavior in tests/contract/engine-api.contract.test.ts
- [X] T020 [P] [US1] Add integration test for free/orbital mode continuity with controlled time in tests/integration/navigation-modes.integration.test.ts
- [X] T021 [P] [US1] Add unit test asserting systems consume TimeContext and avoid direct clock APIs in tests/unit/time-source-boundary.unit.test.ts

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement camera transform state model in src/core/camera/camera-state.ts
- [X] T023 [P] [US1] Implement free navigation controller with TimeContext input in src/core/navigation/free-navigation-controller.ts
- [X] T024 [P] [US1] Implement orbital navigation controller with TimeContext input in src/core/navigation/orbital-navigation-controller.ts
- [X] T025 [US1] Implement navigation mode coordinator in src/core/navigation/navigation-controller.ts
- [X] T026 [P] [US1] Implement circular/elliptical orbit solver in src/core/simulation/orbit-solver.ts
- [X] T027 [US1] Implement SimulationSystem wrapper consuming TimeContext in src/core/simulation/simulation-system.ts
- [X] T028 [P] [US1] Implement Renderer wrapper and scene pipeline in src/rendering/renderer.ts
- [X] T029 [US1] Wire EngineHandle frame loop to sample TimeSource and delegate updates only in src/core/engine/engine-handle.ts
- [X] T030 [US1] Add navigation determinism unit coverage in tests/unit/navigation-controller.unit.test.ts

**Checkpoint**: MVP user story is independently functional and testable

---

## Phase 4: Polish and MVP Readiness

**Purpose**: Finalize docs, contracts, and architecture guardrails

- [X] T031 Update quickstart to MVP-only and TimeSource-aware workflow in specs/001-astronomical-engine/quickstart.md
- [X] T032 [P] Update research summary with TimeSource and orchestration decisions in specs/001-astronomical-engine/research.md
- [X] T033 [P] Align engine API contract with finalized TimeSource/system interfaces in specs/001-astronomical-engine/contracts/engine-api.contract.md
- [X] T034 Finalize public exports and API documentation comments (including TimeSource and RealTimeSource) in src/index.ts

---

## Phase 5: User Story 2 - Spatial Orientation and Navigation Feedback (Priority: P2)

**Goal**: Ensure explorers always understand direction, orientation, and position context through minimal spatial reference visuals and camera-relative controls.

**Independent Test**: Rotate camera, move in free mode, and verify movement is camera-relative while persistent spatial references remain visible; enable/disable development helpers without simulation changes.

### Tests for User Story 2

- [X] T035 [P] [US2] Add integration test for camera-relative movement direction consistency in tests/integration/navigation-orientation.integration.test.ts
- [ ] T036 [P] [US2] Add renderer integration test for persistent spatial references in tests/integration/spatial-references.integration.test.ts
- [ ] T037 [P] [US2] Add unit test for development helper toggle non-interference in tests/unit/dev-helpers.unit.test.ts
- [X] T044 [P] [US2] Add integration test for free-mode control mapping (`W/A/S/D/Q/E + mouse`) in tests/integration/free-controls.integration.test.ts
- [ ] T045 [P] [US2] Add integration test for orbital-mode control mapping (drag orbit + scroll zoom) in tests/integration/orbital-controls.integration.test.ts

### Implementation for User Story 2

- [ ] T038 [P] [US2] Add spatial reference configuration model in src/core/models.ts
- [X] T039 [US2] Extend navigation controller for explicit camera-relative movement mapping in src/core/navigation/navigation-controller.ts
- [X] T040 [P] [US2] Implement minimal background starfield/grid reference layer in src/rendering/renderer.ts
- [X] T041 [P] [US2] Implement optional development visual helpers (axes/markers) in src/rendering/renderer.ts
- [ ] T042 [US2] Wire orientation feedback defaults into scene validation in src/config/schema/scene-schema.ts
- [X] T043 [US2] Update demo viewer to expose direction/orientation feedback in apps/demo/main.ts and apps/demo/three-demo-renderer.ts
- [X] T046 [US2] Implement free-mode key/mouse mapping (`W/A/S/D/Q/E` + mouse-look) in src/core/navigation/free-navigation-controller.ts
- [ ] T047 [US2] Implement orbital-mode drag/scroll mapping around target in src/core/navigation/orbital-navigation-controller.ts

**Checkpoint**: Spatial orientation and navigation feedback are testable and visible with no complex UI overlays.

---

## Deferred (Post-MVP - Not in Current Implementation)

- Multi-scene loading and scene catalog workflows.
- Advanced scaling and precision guard systems.
- Performance benchmark automation and threshold enforcement.
- Rich HUD/minimap instrumentation and multi-panel navigation dashboards.

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 (Setup): No dependencies; start immediately.
- Phase 2 (Foundational): Depends on Phase 1; blocks user story work.
- Phase 3 (US1): Depends on Phase 2; delivers MVP.
- Phase 4 (Polish): Depends on US1 completion.
- Phase 5 (US2): Depends on Phase 3 and reuses existing renderer/navigation foundations.

### User Story Dependencies

- US1 (P1): No dependency on any other user story.
- US2 (P2): Depends on US1 navigation/rendering baseline.

### Within User Story 1

- Contract/integration/unit boundary tests are authored before implementation tasks.
- NavigationController, SimulationSystem, and Renderer are implemented before EngineHandle delegation wiring.
- Story checkpoint must pass before polish phase.

### Within User Story 2

- Orientation/direction tests are authored before renderer/navigation feedback implementation tasks.
- Spatial reference rendering and helper toggles are integrated after camera-relative movement behavior is verified.
- Free/orbital control-mapping integration tests are authored before finalizing mode-specific controller implementations.

---

## Parallel Opportunities

- Setup: T003 can run in parallel with T004 after T001 and T002.
- Foundational: T007, T008, T011, T015 can run in parallel after T006, T009, T013 direction is fixed.
- US1: T018, T019, T020, T021 and T022, T023, T024, T026, T028 can run in parallel; T025, T027, T029 integrate outputs.
- Polish: T032 and T033 can run in parallel.
- US2: T035, T036, T037, T044, T045 and T038, T040, T041 can run in parallel; T039, T042, T043, T046, T047 integrate outputs.

---

## Parallel Example: User Story 1

Parallel test authoring:
- Task: T018 [US1] tests/contract/scene-validation.contract.test.ts
- Task: T019 [US1] tests/contract/engine-api.contract.test.ts
- Task: T020 [US1] tests/integration/navigation-modes.integration.test.ts
- Task: T021 [US1] tests/unit/time-source-boundary.unit.test.ts

Parallel implementation slices:
- Task: T022 [US1] src/core/camera/camera-state.ts
- Task: T023 [US1] src/core/navigation/free-navigation-controller.ts
- Task: T024 [US1] src/core/navigation/orbital-navigation-controller.ts
- Task: T026 [US1] src/core/simulation/orbit-solver.ts
- Task: T028 [US1] src/rendering/renderer.ts

---

## Implementation Strategy

### MVP Delivery Strategy

1. Complete Setup (Phase 1).
2. Complete Foundational prerequisites (Phase 2).
3. Complete User Story 1 (Phase 3) and validate independently.
4. Complete MVP polish and docs (Phase 4).

### Incremental Expansion Strategy (After MVP)

1. Reintroduce deferred advanced scaling and precision work.
2. Reintroduce multi-scene loading workflows.
3. Reintroduce performance benchmarking automation.
4. Expand orientation feedback into optional richer overlays only if explicitly in scope.

---

## Notes

- Only MVP scope is active in this task list.
- Every task includes explicit file paths and strict checklist formatting.
- Suggested immediate implementation target: complete through T030 before any expansion.
- Circular orbit radius policy: stars may use `radius = 0` as root bodies; non-stars must use `radius > 0`.
- Orientation feedback policy: minimal visual references are required; complex overlays remain out of scope.
- Navigation mapping policy: free mode uses camera-relative `W/A/S/D/Q/E + mouse`; orbital mode uses drag-orbit and scroll-zoom.

