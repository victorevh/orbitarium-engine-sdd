# Contract: Engine Public API

Date: 2026-04-25
Spec: [../spec.md](../spec.md)
Data model: [../data-model.md](../data-model.md)

## Purpose

Define the public runtime API surface and internal system interfaces for loading scenes, orchestrating updates, and controlling navigation with TimeSource-based timing.

## Public API Surface (TypeScript-style)

```ts
export type NavigationMode = 'free' | 'orbital';

export interface TimeContext {
  nowSeconds: number;
  deltaSeconds: number;
  tick: number;
}

export interface TimeSource {
  sample(): TimeContext;
}

export interface EngineOptions {
  timeSource?: TimeSource;
}

export interface EngineHandle {
  loadScene(config: SceneConfiguration): ValidationResult;
  start(container: HTMLElement): void;
  stop(): void;

  setNavigationMode(mode: NavigationMode, options?: { targetBodyId?: string }): void;
  getNavigationState(): NavigationState;
  setInertia(enabled: boolean): void;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  code: string;
  message: string;
}
```

## Internal System Interfaces (Behavior Contracts)

```ts
export interface NavigationController {
  update(time: TimeContext): void;
  setMode(mode: NavigationMode, options?: { targetBodyId?: string }): void;
  getState(): NavigationState;
  setInertia(enabled: boolean): void;
}

export interface SimulationSystem {
  update(time: TimeContext): void;
  applyScene(scene: SceneConfiguration): void;
  getSnapshot(): SimulationSnapshot;
}

export interface Renderer {
  render(input: RenderInput): void;
  attach(container: HTMLElement): void;
  detach(): void;
}

export interface RealTimeSource extends TimeSource {}
```

## Behavioral Guarantees

- EngineHandle acts only as lifecycle and orchestration coordinator.
- EngineHandle must obtain frame time exclusively through TimeSource.
- NavigationController and SimulationSystem must consume `TimeContext` passed by EngineHandle.
- NavigationController and SimulationSystem must not call `Date.now` or `performance.now` directly.
- Default TimeSource implementation is real-time (`RealTimeSource`) when no custom source is supplied.
- `loadScene` must perform full validation and return aggregated errors.
- Scene activation must not occur if `ValidationResult.valid` is false.
- `setNavigationMode('orbital')` must require a valid target body.
- API must honor real-time progression only in MVP (no exposed pause/time scaling controls).
- All transforms and vectors are interpreted as right-handed coordinates.

## Error Semantics

- Invalid mode transitions return a typed error and leave engine state unchanged.
- Invalid scene data yields aggregated validation errors and blocks startup.

## Contract Test Requirements

- Contract tests must verify load rejection on invalid configuration.
- Contract tests must verify mode-switch preconditions and state continuity.
- Contract tests must verify TimeSource injection support and default RealTimeSource fallback.
- Contract tests must verify that no public system implementation path requires direct `Date.now` or `performance.now` inside behavior systems.
