# Contract: Solar System Scene Configuration

**Date**: 2026-04-30
**Spec**: [../spec.md](../spec.md)
**Data model**: [../data-model.md](../data-model.md)

## Purpose

Define the external JSON configuration contract for scenes that use Keplerian orbital
mechanics. This contract extends the existing engine scene configuration format; all
existing fields remain valid and backward-compatible.

---

## Top-Level Schema

```json
{
  "sceneId": "solar-system",
  "name": "Realistic Solar System",
  "coordinateSystem": "right-handed",
  "scaleProfile": "<ScaleProfile>",
  "timeScale": "<TimeScaleConfig (optional)>",
  "bodies": ["<CelestialBodyDefinition>"],
  "lights": ["<LightingSourceDefinition>"]
}
```

---

## ScaleProfile

```json
{
  "minZoom": 1,
  "maxZoom": 10000,
  "renderUnitsPerAU": 100
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `minZoom` | `number > 0` | yes | Existing field |
| `maxZoom` | `number > minZoom` | yes | Existing field |
| `renderUnitsPerAU` | `number > 0` | no | Default: 100. Multiplier from AU to Three.js world units |

---

## TimeScaleConfig

```json
{
  "simDaysPerRealSecond": 1.0
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `simDaysPerRealSecond` | `number > 0` | yes (if `timeScale` present) | 1 = 1 sim-day per real second; 365.25 = 1 sim-year per real second |

If the `timeScale` object is omitted entirely, the simulation defaults to
`{ simDaysPerRealSecond: 1 }`.

---

## CelestialBodyDefinition

```json
{
  "bodyId": "earth",
  "type": "planet",
  "size": 0.5,
  "initialPosition": { "x": 0, "y": 0, "z": 0 },
  "rotation": { "angularSpeed": 0, "axis": { "x": 0, "y": 1, "z": 0 } },
  "orbit": "<OrbitProfile>",
  "axialRotation": "<AxialRotation (optional)>"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `bodyId` | `string` (non-empty, unique) | yes | Existing field |
| `type` | `"star" \| "planet" \| "moon"` | yes | Existing field |
| `size` | `number > 0` | yes | Existing field — visual size, renderer-owned |
| `initialPosition` | `Vector3` | yes | Existing field — used as fallback for circular/elliptical |
| `rotation` | `RotationProfile` | yes | Existing field — still required for schema compat |
| `orbit` | `OrbitProfile` | yes | Existing field — now supports `"keplerian"` model |
| `axialRotation` | `AxialRotation` | no | New — used when `orbit.model === "keplerian"` |

---

## OrbitProfile: Keplerian (new variant)

```json
{
  "model": "keplerian",
  "centerBodyId": "sun",
  "semiMajorAxisAU": 1.000,
  "eccentricity": 0.0167,
  "inclinationDeg": 0.0,
  "longitudeAscendingNodeDeg": 348.7,
  "argumentPeriapsisDeg": 114.2,
  "meanAnomalyEpochDeg": 357.5
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `model` | `"keplerian"` | yes | Discriminant |
| `centerBodyId` | `string` | yes | Must reference a body in the scene |
| `semiMajorAxisAU` | `number > 0` | yes | Semi-major axis in AU |
| `eccentricity` | `0 ≤ number < 1` | yes | Hyperbolic (e ≥ 1) rejected by validation |
| `inclinationDeg` | `number` (finite) | yes | Degrees from ecliptic plane |
| `longitudeAscendingNodeDeg` | `number` (finite) | yes | Ω in degrees |
| `argumentPeriapsisDeg` | `number` (finite) | yes | ω in degrees |
| `meanAnomalyEpochDeg` | `number` (finite) | yes | M₀ in degrees at J2000 epoch |

**Derived at runtime** (not stored in config):
- `orbitalPeriodDays = 365.25 × semiMajorAxisAU^1.5`

---

## OrbitProfile: Circular and Elliptical (unchanged)

Existing variants remain fully supported. No changes to their schema.

```json
{ "model": "circular", "centerBodyId": "sun", "radius": 10, "angularSpeed": 0.5 }
{ "model": "elliptical", "centerBodyId": "sun", "semiMajorAxis": 100, "semiMinorAxis": 90, "angularSpeed": 0.3 }
```

---

## AxialRotation

```json
{
  "siderealPeriodDays": 0.997,
  "axialTiltDeg": 23.44,
  "initialPhaseDeg": 0
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `siderealPeriodDays` | `number > 0` | yes | Earth sidereal day ≈ 0.997 days |
| `axialTiltDeg` | `0 ≤ number ≤ 180` | yes | Obliquity from ecliptic north |
| `initialPhaseDeg` | `number` (finite) | no | Default: 0 |

---

## RotationProfile (existing — unchanged for schema)

```json
{
  "angularSpeed": 0,
  "axis": { "x": 0, "y": 1, "z": 0 }
}
```

For Keplerian bodies, the simulation uses `axialRotation` for rotation math; the
`rotation` field is retained in the schema for backward compatibility only.

---

## Validation Behavior

- Full-document validation runs synchronously before scene activation via Zod schema.
- Validation errors are aggregated; all errors are reported before any error is thrown.
- A scene with any validation error MUST NOT activate; no partial state is applied.
- `eccentricity ≥ 1` is a hard error (hyperbolic orbit unsupported).
- `centerBodyId` on Keplerian orbit MUST reference a body that appears earlier in the
  `bodies` array (bodies are solved in definition order).
- `axialRotation.axialTiltDeg` outside `[0, 180]` is a validation error.
- Texture/asset paths are NOT validated at schema time; loading failures are
  renderer-owned concerns.
- `timeScale`, if absent, silently defaults to `{ simDaysPerRealSecond: 1 }`.
- `scaleProfile.renderUnitsPerAU`, if absent, defaults to `100`.

---

## Minimal Keplerian Scene Example

```json
{
  "sceneId": "solar-system-minimal",
  "name": "Minimal Solar System",
  "coordinateSystem": "right-handed",
  "scaleProfile": { "minZoom": 1, "maxZoom": 5000, "renderUnitsPerAU": 100 },
  "timeScale": { "simDaysPerRealSecond": 1 },
  "bodies": [
    {
      "bodyId": "sun",
      "type": "star",
      "size": 5,
      "initialPosition": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "angularSpeed": 0, "axis": { "x": 0, "y": 1, "z": 0 } },
      "orbit": { "model": "circular", "centerBodyId": "sun", "radius": 0, "angularSpeed": 0 }
    },
    {
      "bodyId": "earth",
      "type": "planet",
      "size": 0.5,
      "initialPosition": { "x": 100, "y": 0, "z": 0 },
      "rotation": { "angularSpeed": 0, "axis": { "x": 0, "y": 1, "z": 0 } },
      "orbit": {
        "model": "keplerian",
        "centerBodyId": "sun",
        "semiMajorAxisAU": 1.000,
        "eccentricity": 0.0167,
        "inclinationDeg": 0.0,
        "longitudeAscendingNodeDeg": 348.7,
        "argumentPeriapsisDeg": 114.2,
        "meanAnomalyEpochDeg": 357.5
      },
      "axialRotation": {
        "siderealPeriodDays": 0.997,
        "axialTiltDeg": 23.44
      }
    }
  ],
  "lights": [
    { "lightId": "sun-light", "sourceBodyId": "sun", "intensity": 1.5, "range": 5000 }
  ]
}
```
