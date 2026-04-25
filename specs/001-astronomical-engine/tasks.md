# Tasks: Modular Astronomical Exploration Engine (MVP)

**Input**: Design documents from /specs/001-astronomical-engine/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because MVP requires deterministic behavior, contract compliance, and strict time-source boundaries.

**Organization**: Tasks are grouped by MVP phases with only User Story 1 in scope.

## Format: [ID] [P?] [Story] Description

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: User story label for story-scoped tasks
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [ ] T001 Initialize Node/TypeScript package manifest and scripts in package.json
- [ ] T002 Configure TypeScript compiler and module settings in tsconfig.json
- [ ] T003 [P] Configure Vitest test runner in vitest.config.ts
- [ ] T004 Create root engine exports in src/index.ts
- [ ] T005 Create initial project structure markers in src/core/.gitkeep, src/core/time/.gitkeep, src/rendering/.gitkeep, src/config/.gitkeep, tests/unit/.gitkeep, tests/integration/.gitkeep, tests/contract/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before MVP story implementation

**CRITICAL**: User story work starts only after this phase

- [ ] T006 Define shared numeric/vector/type aliases in src/core/types.ts
- [ ] T007 [P] Define runtime domain models in src/core/models.ts
- [ ] T008 [P] Define validation error envelope types in src/core/validation/validation-error.ts
- [ ] T009 Implement scene configuration schema in src/config/schema/scene-schema.ts
- [ ] T010 Implement full-document validation with aggregated errors in src/core/validation/scene-validator.ts
- [ ] T011 [P] Implement validation-result mapping utilities in src/config/transformers/validation-result-mapper.ts
- [ ] T012 Define system orchestration interfaces (navigation, simulation, renderer, time) in src/core/engine/system-ports.ts
- [ ] T013 Implement TimeSource and TimeContext contracts in src/core/time/time-source.ts
- [ ] T014 Implement default RealTimeSource in src/core/time/real-time-source.ts
- [ ] T015 [P] Implement deterministic TestTimeSource helper in tests/helpers/test-time-source.ts
- [ ] T016 Implement EngineHandle lifecycle skeleton (orchestrator-only, injected TimeSource) in src/core/engine/engine-handle.ts
- [ ] T017 Add deterministic fixture scene in tests/fixtures/minimal-scene.json

**Checkpoint**: Foundation ready for MVP user story

---

## Phase 3: User Story 1 - Navigate a Configured Star System (Priority: P1) MVP

**Goal**: Load one valid scene and provide stable free/orbital navigation with circular/elliptical orbit simulation and rendering.

**Independent Test**: Load a one-star, two-orbiting-body scene; validate free and orbital movement; verify stable camera and deterministic orbit updates driven by TimeSource.

### Tests for User Story 1

- [ ] T018 [P] [US1] Add contract test for aggregated validation failure behavior in tests/contract/scene-validation.contract.test.ts
- [ ] T019 [P] [US1] Add contract test for TimeSource injection and RealTimeSource default behavior in tests/contract/engine-api.contract.test.ts
- [ ] T020 [P] [US1] Add integration test for free/orbital mode continuity with controlled time in tests/integration/navigation-modes.integration.test.ts
- [ ] T021 [P] [US1] Add unit test asserting systems consume TimeContext and avoid direct clock APIs in tests/unit/time-source-boundary.unit.test.ts

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implement camera transform state model in src/core/camera/camera-state.ts
- [ ] T023 [P] [US1] Implement free navigation controller with TimeContext input in src/core/navigation/free-navigation-controller.ts
- [ ] T024 [P] [US1] Implement orbital navigation controller with TimeContext input in src/core/navigation/orbital-navigation-controller.ts
- [ ] T025 [US1] Implement navigation mode coordinator in src/core/navigation/navigation-controller.ts
- [ ] T026 [P] [US1] Implement circular/elliptical orbit solver in src/core/simulation/orbit-solver.ts
- [ ] T027 [US1] Implement SimulationSystem wrapper consuming TimeContext in src/core/simulation/simulation-system.ts
- [ ] T028 [P] [US1] Implement Renderer wrapper and scene pipeline in src/rendering/renderer.ts
- [ ] T029 [US1] Wire EngineHandle frame loop to sample TimeSource and delegate updates only in src/core/engine/engine-handle.ts
- [ ] T030 [US1] Add navigation determinism unit coverage in tests/unit/navigation-controller.unit.test.ts

**Checkpoint**: MVP user story is independently functional and testable

---

## Phase 4: Polish and MVP Readiness

**Purpose**: Finalize docs, contracts, and architecture guardrails

- [ ] T031 Update quickstart to MVP-only and TimeSource-aware workflow in specs/001-astronomical-engine/quickstart.md
- [ ] T032 [P] Update research summary with TimeSource and orchestration decisions in specs/001-astronomical-engine/research.md
- [ ] T033 [P] Align engine API contract with finalized TimeSource/system interfaces in specs/001-astronomical-engine/contracts/engine-api.contract.md
- [ ] T034 Finalize public exports and API documentation comments (including TimeSource and RealTimeSource) in src/index.ts

---

## Deferred (Post-MVP - Not in Current Implementation)

- Multi-scene loading and scene catalog workflows.
- Advanced scaling and precision guard systems.
- Performance benchmark automation and threshold enforcement.

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 (Setup): No dependencies; start immediately.
- Phase 2 (Foundational): Depends on Phase 1; blocks user story work.
- Phase 3 (US1): Depends on Phase 2; delivers MVP.
- Phase 4 (Polish): Depends on US1 completion.

### User Story Dependencies

- US1 (P1): No dependency on any other user story.

### Within User Story 1

- Contract/integration/unit boundary tests are authored before implementation tasks.
- NavigationController, SimulationSystem, and Renderer are implemented before EngineHandle delegation wiring.
- Story checkpoint must pass before polish phase.

---

## Parallel Opportunities

- Setup: T003 can run in parallel with T004 after T001 and T002.
- Foundational: T007, T008, T011, T015 can run in parallel after T006, T009, T013 direction is fixed.
- US1: T018, T019, T020, T021 and T022, T023, T024, T026, T028 can run in parallel; T025, T027, T029 integrate outputs.
- Polish: T032 and T033 can run in parallel.

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

---

## Notes

- Only MVP scope is active in this task list.
- Every task includes explicit file paths and strict checklist formatting.
- Suggested immediate implementation target: complete through T030 before any expansion.
