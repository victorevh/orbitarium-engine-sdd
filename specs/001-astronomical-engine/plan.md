# Implementation Plan: Modular Astronomical Exploration Engine (MVP)

**Branch**: `001-astronomical-engine` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-astronomical-engine/spec.md`

## Summary

Deliver a minimal but fully functional astronomical exploration engine focused on one runnable scene with stable free/orbital navigation, circular/elliptical orbit simulation, and a basic rendering pipeline. EngineHandle is restricted to lifecycle orchestration and must delegate behavior to dedicated systems. All time-dependent behavior uses a TimeSource abstraction with a default real-time implementation. Defer multi-scene loading, performance benchmarking, and advanced scaling/precision systems to post-MVP iterations.

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 22.x (tooling), browser runtime with WebGL2  
**Primary Dependencies**: Three.js, Zod, Vitest  
**Storage**: N/A (configuration files only)  
**Testing**: Vitest (unit/integration/contract) with deterministic fixtures  
**Target Platform**: Desktop-class browsers with WebGL2 support  
**Project Type**: Reusable frontend engine/library (single package)  
**Performance Goals**: Stable interactive rendering for MVP demonstration scenes (formal benchmark targets deferred)  
**Constraints**: Right-handed coordinates only, real-time progression only (1x), no gamification, full validation before scene activation, EngineHandle contains no business logic, no direct Date.now/performance.now calls inside navigation or simulation systems  
**Scale/Scope**: Single-scene lifecycle, stars/planets/moons, circular+elliptical orbit simulation, free+orbital navigation, star-linked lighting

## Architecture Boundaries

### EngineHandle (Lifecycle + Orchestration Only)

- Owns startup/shutdown lifecycle and frame orchestration.
- Composes and invokes `NavigationController`, `SimulationSystem`, and `Renderer` in deterministic order.
- Obtains frame time from `TimeSource` and passes normalized `TimeContext` to behavior systems.
- Routes validated configuration to systems.
- Must not implement navigation rules, orbital math, scene simulation rules, or rendering behavior.

### NavigationController (Behavior System)

- Owns free/orbital mode behavior and transitions.
- Owns camera-target selection and user movement response.
- Consumes `TimeContext` from orchestration.
- Produces navigation state consumed by simulation/rendering orchestration.
- Must not call `Date.now` or `performance.now` directly.

### SimulationSystem (Behavior System)

- Owns orbit and rotation updates (circular/elliptical) in real-time progression.
- Owns deterministic transform updates for celestial bodies.
- Consumes `TimeContext` from orchestration.
- Exposes simulation snapshots/state to rendering.
- Must not call `Date.now` or `performance.now` directly.

### Renderer (Behavior System)

- Owns scene graph updates and draw pipeline behavior.
- Owns star-linked lighting application and visual frame output.
- Renders from system state supplied by orchestration layer.

### TimeSource (Cross-Cutting Abstraction)

- Defines the canonical source of frame time for orchestration.
- Produces monotonically increasing timestamps used to build `TimeContext` (`nowSeconds`, `deltaSeconds`).
- Supports deterministic testing via injectable/custom implementations.
- Default implementation is `RealTimeSource`.

## Constitution Check

*GATE: Must pass before implementation and re-check after MVP completion.*

- **Gate 1 - Stability First**: PASS. Camera stability and coherent interaction remain primary acceptance criteria.
- **Gate 2 - Strong Modularity**: PASS. MVP keeps strict boundaries between orchestrator (`engine`) and behavior systems (`navigation`, `simulation`, `rendering`, `validation`).
- **Gate 3 - No Hidden Behavior**: PASS. No implicit attraction; all movement/orbit behavior is explicit and configuration-driven.
- **Gate 4 - Controlled Visual Quality**: PASS. Rendering remains physically plausible and visually restrained.
- **Gate 5 - Scope Discipline**: PASS. Non-MVP systems (benchmarking, multi-scene, advanced precision/scaling) are deferred by design.
- **Gate 6 - Deterministic/Testable Behavior**: PASS. Deterministic fixtures and module-level tests are retained in MVP.
- **Gate 7 - Time Abstraction Discipline**: PASS. Time-dependent systems receive time only via `TimeSource`/`TimeContext`.

Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-astronomical-engine/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── camera/
│   ├── navigation/
│   ├── simulation/
│   ├── time/
│   ├── validation/
│   └── engine/
├── rendering/
│   ├── scene/
│   └── lighting/
├── config/
│   ├── schema/
│   └── transformers/
└── index.ts

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Keep a single-package library layout with subsystem boundaries for core lifecycle, navigation, orbit simulation, validation, rendering, and shared time abstraction.

## Orchestration Sequence

For each frame tick, orchestration executes in fixed order:

1. `timeContext = TimeSource.sample()`
2. `NavigationController.update(timeContext)`
3. `SimulationSystem.update(timeContext)`
4. `Renderer.render()`

EngineHandle performs only this coordination flow and lifecycle control.

## Deferred Work (Post-MVP)

- Multi-scene catalog loader and scene-switching pipeline.
- Advanced scaling and precision guard systems for extreme near/far ranges.
- Benchmark runner and formal performance threshold automation.

## Complexity Tracking

No constitutional violations require justification in this MVP plan.
