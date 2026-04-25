# Quickstart: Modular Astronomical Exploration Engine

Date: 2026-04-25
Plan: [plan.md](./plan.md)

## Goal

Run a minimal scene with one star and two orbiting bodies, verify navigation modes, and validate configuration behavior.

## Prerequisites

- Node.js 22.x
- npm 10+
- WebGL2-capable desktop browser

## 1. Install dependencies

```bash
npm install
```

## 2. Start development environment

```bash
npm run dev
```

Expected outcome:
- Scene viewer opens with default sample scene.
- Camera starts in free navigation mode.

## 3. Validate scene configuration

```bash
npm run validate:scene -- specs/samples/minimal-scene.json
```

Expected outcome:
- Command exits successfully for valid configuration.
- If invalid, output returns aggregated errors and scene startup is blocked.

## 4. Run tests

```bash
npm run test
npm run test:contract
npm run test:integration
```

Expected outcome:
- Unit tests pass for camera, navigation, orbit, and validation modules.
- Contract tests pass for config schema and engine API.
- Integration tests pass for mode switching and scale transitions.

## 5. Run benchmark profile

```bash
npm run benchmark:scene -- --profile bodies-300
```

Expected outcome:
- Benchmark report indicates >= 60 FPS for 95% of sampled frames on reference desktop hardware.

## 6. Manual acceptance checks

- Switch free/orbital modes repeatedly and verify no visible camera jitter.
- Zoom from system-scale to body-proximity and back without discontinuities.
- Confirm right-handed coordinate conventions by loading canonical sample scenes.

## Sample Minimal Scene (Contract-Oriented)

```json
{
  "sceneId": "sample-minimal",
  "name": "Minimal Star System",
  "coordinateSystem": "right-handed",
  "scaleProfile": {
    "minZoom": 0.001,
    "maxZoom": 10000
  },
  "bodies": [
    {
      "bodyId": "sun-1",
      "type": "star",
      "size": 200,
      "initialPosition": { "x": 0, "y": 0, "z": 0 },
      "rotation": {
        "angularSpeed": 0.02,
        "axis": { "x": 0, "y": 1, "z": 0 }
      },
      "orbit": {
        "model": "circular",
        "centerBodyId": "sun-1",
        "radius": 0,
        "angularSpeed": 0
      }
    }
  ],
  "lights": [
    {
      "lightId": "sun-light",
      "sourceBodyId": "sun-1",
      "intensity": 1.0,
      "range": 1000000
    }
  ]
}
```
