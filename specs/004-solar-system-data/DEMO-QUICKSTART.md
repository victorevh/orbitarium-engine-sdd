# Demo Quickstart: Orbitarium Solar System Viewer

## Starting the Demo

```bash
npm run demo
```

Opens `http://localhost:5173` in your default browser.

## Scene Variants

The demo reads a `?scene=` query parameter from the URL.

| Parameter          | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `?scene=complete`  | Default. Sun, 8 planets, and Earth's Moon (10 bodies total).  |
| `?scene=no-moon`   | Sun and 8 planets only — no Moon (9 bodies).                  |
| `?scene=custom`    | Adds a custom hypothetical body to the complete system.        |

If the parameter is omitted, the `complete` scene is used.

## Status Bar

The status bar at the top of the viewport updates every frame:

```
Date: 2000-01-01 | Earth: 0 orb | Moon: 0 orb | Speed: 1.000 d/s | Mode: Orbital (sun) | Fwd: -Z
```

| Field               | Meaning                                                          |
|---------------------|------------------------------------------------------------------|
| `Date`              | Simulated calendar date (J2000.0 epoch = 2000-Jan-01 12:00 UTC) |
| `Earth: N orb`      | Number of complete Earth orbits elapsed                          |
| `Moon: N orb`       | Number of complete lunar orbits elapsed                          |
| `Speed: X d/s`      | Simulated days advancing per real second                         |
| `Mode`              | Camera mode: `Orbital (bodyId)` or `Free`                        |
| `Fwd`               | Dominant direction the camera faces (+X/−X/+Y/−Y/+Z/−Z)        |

## Camera Modes

### Orbital Mode (default)
The camera orbits a fixed target body (initially the Sun).  
Use the **Orbital** button to re-enter orbital mode targeting the Sun.

Mouse wheel zooms in and out. Zoom is bounded by the scene's scale profile
(`minCameraDistance` ~ 0.5 render units, `maxCameraDistance` ~ 4000 render units
for the default 100 render-units-per-AU scale).

### Free Mode
Press the **Free** button to enter free-flight camera.

| Key / Input          | Action                          |
|----------------------|---------------------------------|
| `W`                  | Move forward                    |
| `S`                  | Move backward                   |
| `A`                  | Strafe left                     |
| `D`                  | Strafe right                    |
| `Q`                  | Move up                         |
| `E`                  | Move down                       |
| Left-click + drag    | Look around (mouse look)        |

## Time Scale Controls

| Key       | Effect                                   |
|-----------|------------------------------------------|
| `+` / `=` | Double the simulation speed              |
| `-` / `_` | Halve the simulation speed               |
| `0`       | Reset to 1 simulated day per real second |

Minimum speed: 0.001 d/s. Maximum speed: 365 250 d/s (≈ 1000 years per real second).

## Body Colours

| Body type | Colour         |
|-----------|----------------|
| Star      | Warm yellow    |
| Planet    | Pale blue      |
| Moon      | Light grey     |

Body mesh radii use a square-root scale so that large bodies (Jupiter, Saturn) are
noticeably bigger than small ones (Mercury, Moon) without overwhelming the viewport.

## Validation

To validate any scene file before loading it in the demo:

```bash
npm run validate:scene -- specs/samples/solar-system-complete.json
npm run validate:scene -- specs/samples/solar-system-no-moon.json
npm run validate:scene -- specs/samples/solar-system-custom-body.json
```

All three should exit successfully with no errors.
