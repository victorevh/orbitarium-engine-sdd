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
  "spatialReferences": {
    "backgroundStars": "boolean",
    "grid": "boolean",
    "developmentHelpers": {
      "enabled": "boolean",
      "axes": "boolean",
      "markers": "boolean"
    }
  },
  "scaleProfile": {
    "minZoom": "number > 0",
    "maxZoom": "number > minZoom"
  },
  "bodies": ["CelestialBodyDefinition", "..."],
  "lights": ["LightingSourceDefinition", "..."]
}
```

## SpatialReferenceSettings

```json
{
  "backgroundStars": "boolean (default true)",
  "grid": "boolean (default false)",
  "developmentHelpers": {
    "enabled": "boolean (default false)",
    "axes": "boolean",
    "markers": "boolean"
  }
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
    "radius": "required when circular; star may use 0, non-star must be > 0",
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
- Circular orbit validation applies by body type: stars may be root with `radius = 0`, non-stars must provide `radius > 0`.
- At least one persistent spatial reference (`backgroundStars` or `grid`) must be enabled.
- Development helpers are optional and valid only when explicitly enabled.

## Error Contract

```json
{
  "valid": false,
  "errors": [
    {
      "path": "bodies[3].orbit.semiMinorAxis",
      "code": "INVALID_VALUE",
      "message": "semiMinorAxis must be > 0 when model is elliptical"
    },
    {
      "path": "bodies[1].orbit.radius",
      "code": "INVALID_VALUE",
      "message": "non-star bodies require orbit.radius > 0 for circular model"
    }
  ]
}
```

## Versioning

- Contract version starts at `1.0.0`.
- Breaking changes require minor feature migration notes in corresponding spec artifacts.
