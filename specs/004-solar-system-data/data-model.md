# Data Model: Full Solar System Dataset

## Entities

### SceneConfiguration

Represents the complete scene definition loaded by the engine.

Fields:

- `sceneId`: string
- `name`: string
- `bodies`: `CelestialBodyDefinition[]`
- `scaleProfile`: `ScaleProfile`
- `timeScale`: `TimeScaleConfig` (optional)
- `sourceMetadata`: `SourceMetadata` (optional)

Validation rules:

- Scene must contain the Sun, eight planets, and Earth's Moon in the core dataset.
- Scene validation is fail-fast; invalid configurations do not initialize.

### CelestialBodyDefinition

Represents a single celestial body in the scene.

Fields:

- `bodyId`: string
- `type`: `star | planet | moon`
- `size`: number
- `orbit`: `KeplerianOrbitProfile`
- `axialRotation`: `AxialRotation` (optional for some bodies)

Validation rules:

- `moon` bodies must define `centerBodyId` and reference a planet.
- `planet` bodies must orbit the Sun in the core solar-system dataset.
- `star` bodies are central emitters and do not orbit a parent body.

### KeplerianOrbitProfile

Represents the orbital elements used by the simulation.

Fields:

- `model`: `keplerian`
- `centerBodyId`: string
- `semiMajorAxisAU`: number
- `eccentricity`: number
- `inclinationDeg`: number
- `longitudeAscendingNodeDeg`: number
- `argumentPeriapsisDeg`: number
- `meanAnomalyEpochDeg`: number

Validation rules:

- `semiMajorAxisAU` must be positive.
- `eccentricity` must satisfy `0 <= e < 1`.
- Angular values must be finite and normalized by schema rules.

### AxialRotation

Represents spin and tilt.

Fields:

- `siderealPeriodDays`: number
- `axialTiltDeg`: number
- `initialPhaseOffsetDeg`: number (optional)

Validation rules:

- `siderealPeriodDays` must be positive.
- `axialTiltDeg` must be within the allowed angular range defined by the schema.

### SourceMetadata

Describes the astronomical reference used by the dataset.

Fields:

- `epoch`: string
- `source`: string
- `referenceDate`: string
- `notes`: string

Validation rules:

- Informational only; no semantic constraints beyond non-empty strings where present.

## Relationships

- The Sun is the central star for the default scene.
- Each planet references the Sun as its `centerBodyId`.
- Earth's Moon references Earth as its `centerBodyId`.
- Optional future moon fixtures can reference their respective parent planets without code changes.

## State Flow

1. Author the JSON scene fixture.
2. Validate the fixture against the schema.
3. Load the validated scene into the simulation system.
4. Emit simulation snapshots for rendering.
5. Render the snapshot in the demo without mutating simulation state.