# Contract: Solar System Scene Configuration

## Purpose

Defines the JSON contract for the complete solar-system dataset and its scene variants.

## Contract Surface

Input: JSON scene configuration file loaded by `EngineHandle.loadScene()` and the demo.

## Top-Level Fields

| Field              | Type                    | Required | Description                                       |
|--------------------|-------------------------|----------|---------------------------------------------------|
| `sceneId`          | string                  | yes      | Unique identifier for the scene                   |
| `name`             | string                  | yes      | Human-readable scene name                         |
| `coordinateSystem` | `"right-handed"`        | yes      | Coordinate convention (only right-handed allowed) |
| `scaleProfile`     | `ScaleProfile`          | yes      | Render-unit conversion and zoom bounds            |
| `bodies`           | `CelestialBodyDefinition[]` | yes  | All simulated bodies                              |
| `lights`           | `LightingSourceDefinition[]` | yes | Scene lighting                                   |
| `timeScale`        | `TimeScaleConfig`       | no       | Default simulation speed                          |
| `sourceMetadata`   | `SourceMetadata`        | no       | Epoch and reference documentation                 |

## ScaleProfile

| Field              | Type   | Required | Description                                        |
|--------------------|--------|----------|----------------------------------------------------|
| `minZoom`          | number | yes      | Minimum zoom value for the renderer                |
| `maxZoom`          | number | yes      | Maximum zoom value for the renderer                |
| `renderUnitsPerAU` | number | no       | Scale factor: 1 AU = N render units (default 100)  |

## SourceMetadata

| Field           | Type   | Required | Description                                      |
|-----------------|--------|----------|--------------------------------------------------|
| `epoch`         | string | no       | Orbital element epoch (e.g. `"J2000.0"`)         |
| `source`        | string | no       | Data source name                                 |
| `referenceDate` | string | no       | ISO 8601 reference date for element values       |
| `notes`         | string | no       | Additional traceability notes                    |

## CelestialBodyDefinition

| Field           | Type              | Required | Description                                           |
|-----------------|-------------------|----------|-------------------------------------------------------|
| `bodyId`        | string            | yes      | Unique body identifier                                |
| `type`          | `BodyType`        | yes      | `"star"`, `"planet"`, or `"moon"`                     |
| `size`          | number            | yes      | Approximate size in Earth radii                       |
| `initialPosition` | `Vector3`       | yes      | Starting position (AU or render units)                |
| `rotation`      | `RotationProfile` | yes      | Legacy rotation parameters                            |
| `orbit`         | `OrbitProfile`    | yes      | Orbital parameters; Keplerian model required for 004  |
| `axialRotation` | `AxialRotation`   | no       | Sidereal period and axial tilt                        |

## Body Type Rules

- `type: "star"` — reserved for the Sun; must be the Keplerian center of all planet orbits.
- `type: "planet"` — used for the eight major planets; `centerBodyId` must reference the Sun.
- `type: "moon"` — used for moons; `centerBodyId` must reference a planet body in the same scene.

## Keplerian Orbit Rules

All bodies in the 004 dataset use `model: "keplerian"`:

| Field                      | Constraint              |
|----------------------------|-------------------------|
| `semiMajorAxisAU`          | > 0                     |
| `eccentricity`             | 0 ≤ e < 1               |
| `inclinationDeg`           | 0–180°                  |
| `longitudeAscendingNodeDeg`| 0–360°                  |
| `argumentPeriapsisDeg`     | 0–360°                  |
| `meanAnomalyEpochDeg`      | 0–360°                  |

## Validation Rules

- Missing or invalid Keplerian parameters fail fast before scene initialisation.
- A `moon` with a `centerBodyId` not matching any body in `bodies` fails fast.
- `eccentricity < 0` or `eccentricity >= 1` fails validation.
- `semiMajorAxisAU <= 0` fails validation.
- `coordinateSystem` values other than `"right-handed"` are rejected.

## Scene Variants

| File                              | Bodies | Description                              |
|-----------------------------------|--------|------------------------------------------|
| `solar-system-complete.json`      | 10     | Canonical: Sun, 8 planets, Earth's Moon  |
| `solar-system-no-moon.json`       | 9      | Sun and 8 planets; no Moon               |
| `solar-system-custom-body.json`   | 11+    | `complete` plus one custom hypothetical body |

## Consumer Expectations

- The engine reads the scene configuration as immutable input.
- `EngineHandle.loadScene()` returns a `ValidationResult`; callers must check `valid` before proceeding.
- The simulation emits `bodyStates` (positions in AU) and does not mutate the scene.
- The renderer converts AU positions to render units via `createScaleTransform(renderUnitsPerAU)`.
- Body mesh radii are derived from `body.size` via `scaleBodySize(size) = Math.max(0.3, Math.sqrt(size))`.
- Zoom bounds in the demo are `[0.5, renderUnitsPerAU * 40]` render units.
