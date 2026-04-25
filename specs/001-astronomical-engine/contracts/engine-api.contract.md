# Contract: Engine Public API

Date: 2026-04-25
Spec: [../spec.md](../spec.md)
Data model: [../data-model.md](../data-model.md)

## Purpose

Define the public runtime API surface for loading scenes and controlling navigation.

## API Surface (TypeScript-style)

```ts
export type NavigationMode = 'free' | 'orbital';

export interface EngineHandle {
  loadScene(config: SceneConfiguration): ValidationResult;
  start(container: HTMLElement): void;
  stop(): void;

  setNavigationMode(mode: NavigationMode, options?: { targetBodyId?: string }): void;
  getNavigationState(): NavigationState;
  setInertia(enabled: boolean): void;

  setZoom(zoomLevel: number): void;
  getPerformanceSnapshot(): PerformanceSnapshot;
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

export interface PerformanceSnapshot {
  fps: number;
  activeBodies: number;
  frameTimeMsP95: number;
}
```

## Behavioral Guarantees

- `loadScene` must perform full validation and return aggregated errors.
- Scene activation must not occur if `ValidationResult.valid` is false.
- `setNavigationMode('orbital')` must require a valid target body.
- API must honor real-time progression only in v1 (no exposed pause/time scaling controls).
- All transforms and vectors are interpreted as right-handed coordinates.

## Error Semantics

- Invalid mode transitions return a typed error and leave engine state unchanged.
- Invalid zoom requests clamp or reject per configured scale profile (implementation decision must remain deterministic and documented).

## Contract Test Requirements

- Contract tests must verify load rejection on invalid configuration.
- Contract tests must verify mode-switch preconditions and state continuity.
- Contract tests must verify that no public API exposes time scaling controls in v1.
