# Implementation Plan: Full Solar System Dataset

**Branch**: `004-solar-system-data` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `spec.md`

## Summary

Deliver a complete solar system dataset for the existing orbitarium engine: Sun, all 8 major planets, Earth's Moon, epoch metadata, and optional moon fixtures for future expansion. The feature stays data-driven: it reuses the current Keplerian simulation path, keeps simulation deterministic, enforces strict scene validation, and updates the demo to load the new scene variants without changing the core physics model.

## Technical Context

**Language/Version**: TypeScript 5.6, ES2022 modules  
**Primary Dependencies**: Three.js 0.176.0, Zod, Vitest 2.1.3, Vite, existing orbitarium engine modules  
**Storage**: JSON scene fixtures under `specs/samples/`; no database  
**Testing**: Vitest unit/integration/contract suites; headless validation for scene loading and orbital behavior  
**Target Platform**: Browser-based demo and engine library usage  
**Project Type**: TypeScript web demo + reusable engine library  
**Performance Goals**: Preserve deterministic simulation and the existing render budget; keep the demo stable at interactive frame rates with 10 bodies  
**Constraints**: Strict simulation/render separation, no wall-clock dependence inside simulation, fail-fast validation for invalid orbital parameters  
**Scale/Scope**: 10-body core dataset plus optional moon fixtures, documentation, and validation artifacts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|---|---|---|
| Simulation determinism | PASS | Dataset and validation are configuration-driven; no nondeterministic integrators or wall-clock dependencies are introduced. |
| Numerical stability | PASS | Existing Keplerian solver and time-scale model are reused; feature scope is data and validation, not a new integrator. |
| Simulation/render separation | PASS | Simulation continues to emit read-only state; rendering consumes body state and scale transforms only. |
| TDD compliance for physics code | PASS | Spec and tasks require failing tests first for validation and visualization cases. |
| Rendering performance budget | PASS | No new heavy per-frame systems are added; the demo continues to target the existing frame budget. |

No constitution violations require justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-solar-system-data/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── solar-system-config.contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── config/
│   └── schema/
├── core/
│   ├── engine/
│   └── simulation/
├── rendering/
└── index.ts

apps/
└── demo/

tests/
├── contract/
├── integration/
└── unit/

specs/
├── samples/
└── 004-solar-system-data/
    └── contracts/
```

**Structure Decision**: Keep the existing single TypeScript engine plus browser demo layout. The feature adds JSON fixtures, validation docs, and tests; it does not require new packages or a new application boundary.

## Phase 0: Research Output

Research is intentionally narrow because the key decisions are already resolved by clarification:

- Epoch handling: configurable epoch metadata with J2000.0 as the default stable reference.
- Moon scope: Earth's Moon in the core dataset, with optional predefined moon fixtures for other planets.
- Schema design: explicit `moon` body type in the scene schema.
- Validation strategy: fail-fast rejection for invalid orbital parameters.

`research.md` will capture these decisions, the rationale, and rejected alternatives so the implementation and task generation stay consistent with the spec.

## Phase 1: Design Output

The first design pass will produce:

- `data-model.md` describing the scene, body, orbital, rotation, and source-metadata entities.
- `contracts/solar-system-config.contract.md` describing the JSON scene contract for the complete dataset and variants.
- `quickstart.md` describing how to validate the scene and run the demo variants.

The design must preserve the existing engine contracts: simulation stays in AU-space, rendering stays in render space, and all validation failures are reported before a scene initializes.

## Phase 2: Task Handoff

Once the design artifacts are in place, `/speckit.tasks` can generate the implementation checklist. That task list should keep the existing TDD ordering: write failing tests for data validation and visualization first, then implement the fixture/schema/demo updates, then finish with full regression and demo verification.

## Complexity Tracking

No complexity exceptions are required. The feature stays within the existing architecture and only extends it with data, schema, and demo wiring.
