# Contract: Scene Configuration

Date: 2026-04-25
Spec: [../spec.md](../spec.md)
Data model: [../data-model.md](../data-model.md)

## Purpose

Define the external scene configuration contract consumed by the engine.

## Format

- Serialization: JSON
- Encoding: UTF-8
- Coordinate convention: required `right-handed`

## Top-Level Schema

```json
{
  "sceneId": "string",
  "name": "string",
  "coordinateSystem": "right-handed",
  "scaleProfile": {
    "minZoom": "number > 0",
    "maxZoom": "number > minZoom"
  },
  "bodies": ["CelestialBodyDefinition", "..."],
  "lights": ["LightingSourceDefinition", "..."]
}
```

## CelestialBodyDefinition

```json
{
  "bodyId": "string(unique)",
  "type": "star | planet | moon",
  "size": "number > 0",
  "initialPosition": { "x": "number", "y": "number", "z": "number" },
  "rotation": {
    "angularSpeed": "finite number",
    "axis": { "x": "number", "y": "number", "z": "number and not all zero" },
    "phaseOffset": "number (optional)"
  },
  "orbit": {
    "model": "circular | elliptical",
    "centerBodyId": "string",
    "radius": "number > 0 when circular",
    "semiMajorAxis": "number > 0 when elliptical",
    "semiMinorAxis": "number > 0 when elliptical",
    "angularSpeed": "finite number",
    "phaseOffset": "number (optional)"
  }
}
```

## LightingSourceDefinition

```json
{
  "lightId": "string(unique)",
  "sourceBodyId": "string(reference star bodyId)",
  "intensity": "number > 0",
  "range": "number > 0"
}
```

## Validation Behavior

- Full-document validation is required before scene activation.
- Validation errors are aggregated into one response.
- Scene activation is aborted if any validation error exists.

## Error Contract

```json
{
  "valid": false,
  "errors": [
    {
      "path": "bodies[3].orbit.semiMinorAxis",
      "code": "INVALID_VALUE",
      "message": "semiMinorAxis must be > 0 when model is elliptical"
    }
  ]
}
```

## Versioning

- Contract version starts at `1.0.0`.
- Breaking changes require minor feature migration notes in corresponding spec artifacts.
