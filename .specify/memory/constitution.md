<!--
SYNC IMPACT REPORT
Version: 1.0.0 → 1.1.0
Bump type: MINOR — two new sections added (Simulation Principles, Testing & Development Principles);
           two existing sections materially expanded (Architecture, Rendering).

Modified principles:
  - Architecture Principles: added strict simulation/rendering separation rule
  - Rendering Principles: expanded with explicit performance budget constraints
  - Quality Requirements: updated to reference new principle sections

Added sections:
  - Simulation Principles (deterministic simulation + numerical stability)
  - Testing & Development Principles (TDD mandate for core physics)

Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check section is generic;
    plan-filling agents will apply updated gates automatically.
  - .specify/templates/spec-template.md ✅ No constitution-specific references; no change required.
  - .specify/templates/tasks-template.md ✅ TDD-first ordering already present;
    physics features must explicitly request tests in their spec to trigger test tasks.

Follow-up TODOs: none — all placeholders resolved.
-->

# Orbitarium Engine Constitution

## Core Philosophy

- Prioritize visual stability, smoothness, and clarity over feature quantity.
- Keep movement, scale, and camera behavior coherent in a spatial environment.
- Ground all simulation in physical correctness; accept approximation only when explicitly justified.

## Architecture Principles

- Enforce strong modularity across camera, navigation, rendering, and celestial-body systems.
- Use clear contracts between modules.
- Avoid hidden or implicit behaviors such as automatic attraction forces.
- Keep systems reusable and composable.
- The simulation layer and the rendering layer MUST be strictly separated: simulation state MUST NOT
  depend on any rendering state, and rendering MUST consume simulation output as read-only data.
- No rendering-domain types (scene graphs, GPU resources, materials) MAY appear in simulation code;
  no simulation-domain types (body state, integrator) MAY appear in render-pipeline code.

## Simulation Principles

- The simulation MUST be deterministic: identical initial conditions and time-step inputs MUST
  produce identical outputs across platforms, runs, and build configurations.
- Floating-point operations MUST be ordered and typed to minimize catastrophic cancellation;
  use compensated summation (e.g. Kahan) or equivalent wherever accumulation occurs over many steps.
- Body positions and inter-body distances MUST be represented in a coordinate system that preserves
  precision at astronomical scales (e.g. 64-bit floating point or hierarchical origin shifting);
  precision loss that produces visible drift is a blocking defect.
- Time integration MUST use a numerically stable integrator (symplectic Euler, Störmer–Verlet,
  or RK4) chosen for the energy-conservation requirements of each simulated system.
- Simulation tick rate MUST be decoupled from rendering frame rate; the renderer MUST interpolate
  between simulation snapshots rather than driving or skipping simulation steps.

## Rendering Principles

- Target high but controlled visual quality.
- Keep lighting physically plausible, with acceptable simplification for performance.
- Avoid noisy or unstable visuals.
- The renderer MUST sustain 60 fps at 1080p on the defined reference hardware; sustained drops
  below 30 fps are a blocking defect requiring immediate triage.
- Per-frame GPU budget MUST be tracked; any feature that exceeds its allocated budget MUST degrade
  gracefully (LOD reduction, feature disable) rather than stalling the render loop.
- CPU-side render preparation (frustum culling, LOD selection, draw-call batching) MUST complete
  within 2 ms per frame on the reference CPU so the simulation thread is never starved.

## Interaction Principles

- Camera behavior must remain stable and jitter-free.
- Navigation must support full 3D movement across X, Y, and Z.
- Movement must feel smooth, with optional inertia.

## Scalability Principles

- Support large differences in scale, from space-level to close planetary proximity.
- Keep transitions smooth and continuous.

## Testing & Development Principles

- All core physics and simulation logic MUST be developed test-first: failing unit tests MUST be
  committed before any implementation of the tested behavior is written.
- Physics unit tests MUST be hermetic: no file I/O, no rendering context, no GPU dependency.
- Numerical correctness tests MUST include regression cases that verify energy conservation,
  angular momentum conservation, and round-trip determinism over a fixed number of ticks.
- Simulation integration tests MUST run in a headless environment and MUST be part of the CI gate;
  a CI pipeline that skips these tests MUST NOT be used to gate a merge.
- Tests that assert rendering output (screenshot diffs, pixel comparisons) MUST be explicitly
  labeled as visual-regression tests and kept in a separate suite from physics tests.

## Non-Goals

- No gamification features.
- No scoring systems.
- No arcade-style behavior.

## Quality Requirements

- Each module must be independently testable.
- Behavior must be predictable and deterministic (enforced by Simulation Principles).
- Prefer stability, modularity, and visual clarity over complexity.
- Any new feature MUST pass constitution checks for simulation determinism, layer separation,
  TDD compliance, and rendering performance budget before merging.

## Governance

- This constitution governs architecture and quality decisions for planning and implementation artifacts.
- Any amendment must preserve determinism and modularity requirements and must be reflected in
  planning artifacts.
- The Constitution Check section in plan.md MUST explicitly address: simulation determinism,
  numerical stability, simulation/rendering layer separation, TDD compliance for physics code,
  and rendering performance budget.
- MAJOR version bumps require explicit ratification by the project lead before taking effect.

**Version**: 1.1.0 | **Ratified**: 2026-04-25 | **Last Amended**: 2026-04-30
