# Research: Full Solar System Dataset

## Epoch Handling

- **Decision**: Make the epoch configurable via `sourceMetadata.epoch`, with J2000.0 as the default reference in the shipped dataset.
- **Rationale**: J2000.0 is a stable astronomical baseline, while a configurable epoch keeps the dataset useful if a later release wants a current-epoch snapshot.
- **Alternatives considered**:
  - Fixed J2000.0 only: simpler, but less flexible for future data updates.
  - Current epoch only: more time-sensitive, but creates maintenance churn and makes tests brittle.

## Moon Support Scope

- **Decision**: Ship Earth's Moon in the core dataset and provide predefined optional fixtures for other planetary moons.
- **Rationale**: Earth's Moon is the required core case; extra moon fixtures add value without expanding the core scene unnecessarily.
- **Alternatives considered**:
  - Earth’s Moon only: narrower scope, but less extensible for future scenes.
  - Full multi-moon catalog in the core scene: too broad for the feature's initial delivery.

## Schema Shape

- **Decision**: Add an explicit `moon` body type to the scene schema.
- **Rationale**: A distinct body type keeps validation and rendering intent clear and yields better errors than implicit moon inference.
- **Alternatives considered**:
  - Reuse `planet` with special `centerBodyId` rules: smaller schema change, but ambiguous and harder to validate.
  - Hierarchical body-role model: flexible, but unnecessary complexity for the current feature.

## Validation Strategy

- **Decision**: Strict rejection of invalid orbital parameters and invalid parent-body relationships.
- **Rationale**: The feature is about trustworthy astronomical data; silent correction would undermine traceability and could hide data issues.
- **Alternatives considered**:
  - Auto-correct invalid values: convenient, but silently changes source data.
  - Warn and continue: keeps the app running, but allows bad scenes to initialize.

## Contract Surface

- **Decision**: Document the JSON scene contract as the external interface for the dataset.
- **Rationale**: The feature is configuration-driven, so the scene file is the user-facing API.
- **Alternatives considered**:
  - No contract docs: cheaper now, but weaker for integration and testing.
  - Separate contract per body type: unnecessary fragmentation for a small feature set.