# Research: Modular Astronomical Exploration Engine

Date: 2026-04-25
Feature: [spec.md](./spec.md)

## Decision 1: Engine Runtime and Module Boundaries

Decision: Implement a TypeScript engine library with explicit subsystem boundaries (`camera`, `navigation`, `simulation`, `rendering`, `validation`).

Rationale: This directly enforces the constitution requirement for strong modularity, deterministic behavior, and independent testability.

Alternatives considered: Monolithic scene manager with shared mutable state. Rejected because it increases coupling and makes jitter/scale bugs harder to isolate.

## Decision 2: Orbit Model Scope

Decision: Support circular and elliptical orbit profiles in v1 with parameters for center reference, radius or axes, angular speed, and phase offset.

Rationale: Matches clarified scope while keeping the simulation predictable and data-driven.

Alternatives considered: Arbitrary parametric equations. Rejected for v1 due to complexity and lower testability.

## Decision 3: Camera Stability Strategy

Decision: Use deterministic update order per frame (`input -> navigation integration -> camera solve -> render`) and bounded interpolation for smooth transitions.

Rationale: A stable order and bounded smoothing reduce jitter and prevent mode-switch discontinuities.

Alternatives considered: Unbounded lerp easing with event-driven updates. Rejected due to drift and non-deterministic behavior under variable frame timing.

## Decision 4: Configuration Validation Strategy

Decision: Validate full scene configuration before activation, return aggregated errors, and block scene startup on any error.

Rationale: Matches clarified requirement and gives creators complete feedback in one pass.

Alternatives considered: Fail-fast first error, or partial load with warnings. Rejected because each can hide additional issues and produce inconsistent runtime states.

## Decision 5: Coordinate Convention

Decision: Standardize all scene definitions and runtime transforms to a right-handed coordinate system.

Rationale: Ensures consistent math behavior, portable scenes, and simpler contracts across modules.

Alternatives considered: Per-scene handedness toggles. Rejected because conversion paths increase complexity and risk subtle transform bugs.

## Decision 6: Performance and Test Strategy

Decision: Target 60 FPS with up to 300 active bodies on reference desktop hardware, with automated benchmark scenes and deterministic scripted navigation paths.

Rationale: Aligns with clarified performance outcomes and keeps validation measurable.

Alternatives considered: No explicit target in v1, or 1000-body target. Rejected because no target is not testable, and 1000 bodies is high-risk for early scope.

## Clarification Resolution Status

All previously unresolved implementation-impacting ambiguities are resolved for planning. No `NEEDS CLARIFICATION` items remain in planning context.
