# Data Model: Modular Astronomical Exploration Engine

Date: 2026-04-25
Feature: [spec.md](./spec.md)

## Entity: SceneConfiguration

Description: Root definition for a loadable celestial scene.

Fields:
- `sceneId` (string, required): Unique scene identifier.
- `name` (string, required): Human-readable scene name.
- `coordinateSystem` (enum, required): Must be `right-handed`.
- `scaleProfile` (object, required): Global scale and zoom behavior parameters.
- `bodies` (array<CelestialBodyDefinition>, required): All celestial objects in scene.
- `lights` (array<LightingSourceDefinition>, required): Star-linked lighting definitions.

Validation rules:
- `sceneId` must be unique within loaded catalog.
- `coordinateSystem` must equal `right-handed`.
- `bodies.length` must be `<= 300` for benchmark profile conformance.
- At least one valid star-linked light source must exist.

## Entity: CelestialBodyDefinition

Description: Data-driven celestial object configuration.

Fields:
- `bodyId` (string, required): Unique body identifier.
- `type` (enum, required): `star | planet | moon`.
- `size` (number, required): Positive radius-like scalar.
- `initialPosition` (Vector3, required): Start position in scene coordinates.
- `rotation` (RotationProfile, required): Angular rotation behavior.
- `orbit` (OrbitProfile, required): Orbital behavior around center body.

Validation rules:
- `bodyId` must be unique in scene.
- `size` must be greater than zero.
- `orbit.centerBodyId` must reference an existing body unless explicitly root-centered for stars.
- `type` and orbit constraints must not create invalid parent cycles.

## Entity: OrbitProfile

Description: Defines circular/elliptical orbital motion.

Fields:
- `model` (enum, required): `circular | elliptical`.
- `centerBodyId` (string, required): Orbital center reference.
- `radius` (number, required when `model=circular`): Positive scalar.
- `semiMajorAxis` (number, required when `model=elliptical`): Positive scalar.
- `semiMinorAxis` (number, required when `model=elliptical`): Positive scalar.
- `angularSpeed` (number, required): Angular velocity in radians/second.
- `phaseOffset` (number, optional): Initial angular offset.

Validation rules:
- Exactly one model branch is valid (`radius` xor ellipse axes).
- Axes/radius must be positive.
- `angularSpeed` must be finite.

## Entity: RotationProfile

Description: Self-rotation behavior for a body.

Fields:
- `angularSpeed` (number, required): Rotation speed.
- `axis` (Vector3, required): Rotation axis in right-handed coordinates.
- `phaseOffset` (number, optional): Initial rotation offset.

Validation rules:
- `axis` cannot be zero vector.
- `angularSpeed` must be finite.

## Entity: LightingSourceDefinition

Description: Illumination definition driven by a star body.

Fields:
- `lightId` (string, required): Unique light identifier.
- `sourceBodyId` (string, required): Referenced star body.
- `intensity` (number, required): Positive scalar.
- `range` (number, required): Positive influence range.

Validation rules:
- `sourceBodyId` must reference an existing body of type `star`.
- `intensity` and `range` must be positive.

## Entity: NavigationState

Description: Runtime user interaction state.

Fields:
- `mode` (enum, required): `free | orbital`.
- `position` (Vector3, required): Camera/navigation position.
- `orientation` (Quaternion or equivalent, required): Camera orientation.
- `zoomLevel` (number, required): Continuous zoom scalar.
- `inertiaEnabled` (boolean, required): Whether inertia smoothing is active.
- `orbitalTargetBodyId` (string, optional): Required in orbital mode.

Validation rules:
- `orbitalTargetBodyId` required when `mode=orbital`.
- `zoomLevel` must remain within configured scale profile limits.

## Relationships

- `SceneConfiguration` 1..* `CelestialBodyDefinition`
- `SceneConfiguration` 1..* `LightingSourceDefinition`
- `CelestialBodyDefinition` 1..1 `RotationProfile`
- `CelestialBodyDefinition` 1..1 `OrbitProfile`
- `OrbitProfile.centerBodyId` -> `CelestialBodyDefinition.bodyId`
- `LightingSourceDefinition.sourceBodyId` -> `CelestialBodyDefinition.bodyId (star)`

## State Transitions

### SceneLoadState

- `unloaded -> validating -> ready`
- `validating -> validation_failed` when any validation error exists
- Transition to `ready` is blocked unless validation has zero errors

### Navigation Mode

- `free -> orbital` requires valid target body selection
- `orbital -> free` clears target lock and preserves current camera transform continuity

## Error Aggregation Model

- Validation returns a collection of errors with `path`, `code`, and `message`.
- All detectable errors are returned in one pass.
- Scene activation is aborted if error collection is non-empty.
