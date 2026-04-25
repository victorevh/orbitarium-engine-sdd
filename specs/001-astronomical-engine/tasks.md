# Tasks: Modular Astronomical Exploration Engine (MVP)

**Input**: Design documents from `/specs/001-astronomical-engine/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because MVP still requires deterministic and independently testable behavior.

**Organization**: Tasks are grouped by MVP execution phases with only User Story 1 in scope.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label for story-scoped tasks
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [ ] T001 Initialize Node/TypeScript package manifest and scripts in package.json
- [ ] T002 Configure TypeScript compiler and module settings in tsconfig.json
- [ ] T003 [P] Configure test runner in vitest.config.ts
- [ ] T004 Create root engine exports in src/index.ts
- [ ] T005 Create initial project structure markers in src/core/.gitkeep, src/rendering/.gitkeep, src/config/.gitkeep, tests/unit/.gitkeep, tests/integration/.gitkeep, tests/contract/.gitkeep

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
- [ ] T012 Define system orchestration interfaces (navigation/simulation/renderer ports) in src/core/engine/system-ports.ts
- [ ] T013 [P] Implement deterministic real-time frame clock (1x only) in src/core/simulation/frame-clock.ts
- [ ] T014 Implement EngineHandle lifecycle skeleton (orchestrator-only, no business logic) in src/core/engine/engine-handle.ts
- [ ] T015 Add deterministic fixture scene in tests/fixtures/minimal-scene.json

**Checkpoint**: Foundation ready for MVP user story

---

## Phase 3: User Story 1 - Navigate a Configured Star System (Priority: P1) 🎯 MVP

**Goal**: Load one valid scene and provide stable free/orbital navigation with circular/elliptical orbit simulation and rendering.

**Independent Test**: Load a one-star, two-orbiting-body scene; validate free and orbital movement; verify stable camera and deterministic orbit updates.

### Tests for User Story 1

- [ ] T016 [P] [US1] Add contract test for aggregated validation failure behavior in tests/contract/scene-validation.contract.test.ts
- [ ] T017 [P] [US1] Add contract test for engine orchestration/delegation guarantees in tests/contract/engine-api.contract.test.ts
- [ ] T018 [P] [US1] Add integration test for free/orbital mode continuity in tests/integration/navigation-modes.integration.test.ts
- [ ] T019 [P] [US1] Add unit test asserting EngineHandle does not perform business logic in tests/unit/engine-orchestration.unit.test.ts

### Implementation for User Story 1

- [ ] T020 [P] [US1] Implement camera transform state model in src/core/camera/camera-state.ts
- [ ] T021 [P] [US1] Implement free navigation controller in src/core/navigation/free-navigation-controller.ts
- [ ] T022 [P] [US1] Implement orbital navigation controller in src/core/navigation/orbital-navigation-controller.ts
- [ ] T023 [US1] Implement navigation mode coordinator in src/core/navigation/navigation-controller.ts
- [ ] T024 [P] [US1] Implement circular/elliptical orbit solver in src/core/simulation/orbit-solver.ts
- [ ] T025 [US1] Implement SimulationSystem behavior orchestration wrapper in src/core/simulation/simulation-system.ts
- [ ] T026 [P] [US1] Implement Renderer behavior wrapper and scene pipeline in src/rendering/renderer.ts
- [ ] T027 [US1] Wire EngineHandle lifecycle to delegate only to NavigationController, SimulationSystem, and Renderer in src/core/engine/engine-handle.ts
- [ ] T028 [US1] Add navigation determinism unit coverage in tests/unit/navigation-controller.unit.test.ts

**Checkpoint**: MVP user story is independently functional and testable

---

## Phase 4: Polish & MVP Readiness

**Purpose**: Finalize MVP docs, contracts, and validation flow

- [ ] T029 Update quickstart to MVP-only and orchestrator-boundary workflow in specs/001-astronomical-engine/quickstart.md
- [ ] T030 [P] Update research summary with orchestrator-only architecture decisions in specs/001-astronomical-engine/research.md
- [ ] T031 [P] Align API contract to orchestrator/delegation boundaries in specs/001-astronomical-engine/contracts/engine-api.contract.md
- [ ] T032 Finalize public exports and API documentation comments in src/index.ts

---

## Deferred (Post-MVP - Not in Current Implementation)

- Multi-scene loading and scene catalog workflows.
- Advanced scaling and precision guard systems.
- Performance benchmark automation and threshold enforcement.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks user story work.
- **Phase 3 (US1)**: Depends on Phase 2; delivers MVP.
- **Phase 4 (Polish)**: Depends on US1 completion.

### User Story Dependencies

- **US1 (P1)**: No dependency on any other user story.

### Within User Story 1

- Contract/integration tests are authored before implementation tasks.
- NavigationController, SimulationSystem, and Renderer are implemented before EngineHandle delegation wiring.
- Story checkpoint must pass before polish phase.

---

## Parallel Opportunities

- **Setup**: T003 can run in parallel with T004 once T001 and T002 are established.
- **Foundational**: T007, T008, T011, T013 can run in parallel after T006/T009 direction is fixed.
- **US1**: T016, T017, T018, T019 and T020, T021, T022, T024, T026 can run in parallel; T023/T025/T027 integrate outputs.
- **Polish**: T030 and T031 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel test authoring
Task: "T016 [US1] tests/contract/scene-validation.contract.test.ts"
Task: "T017 [US1] tests/contract/engine-api.contract.test.ts"
Task: "T018 [US1] tests/integration/navigation-modes.integration.test.ts"
Task: "T019 [US1] tests/unit/engine-orchestration.unit.test.ts"

# Parallel implementation slices
Task: "T020 [US1] src/core/camera/camera-state.ts"
Task: "T021 [US1] src/core/navigation/free-navigation-controller.ts"
Task: "T022 [US1] src/core/navigation/orbital-navigation-controller.ts"
Task: "T024 [US1] src/core/simulation/orbit-solver.ts"
Task: "T025 [US1] src/core/simulation/simulation-system.ts"
Task: "T026 [US1] src/rendering/renderer.ts"
```

---

## Implementation Strategy

### MVP Delivery Strategy

1. Complete Setup (Phase 1).
2. Complete Foundational prerequisites (Phase 2).
3. Complete User Story 1 (Phase 3) and validate independently.
4. Complete MVP polish and docs (Phase 4).

### Incremental Expansion Strategy (After MVP)

1. Reintroduce deferred advanced scaling/precision work.
2. Reintroduce multi-scene loading workflows.
3. Reintroduce performance benchmarking automation.

---

## Notes

- Only MVP scope is active in this task list.
- Every task includes explicit file paths and strict checklist formatting.
- Suggested immediate implementation target: complete through T028 before any expansion.
