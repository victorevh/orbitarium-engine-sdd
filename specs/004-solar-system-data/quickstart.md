# Quickstart: Full Solar System Dataset

## Validate the Scene

Run the scene validator against the complete dataset:

```bash
npm run validate:scene -- specs/samples/solar-system-complete.json
```

Expected result: exits with code 0 and prints no errors.

To confirm rejection behaviour, run against a deliberately invalid file:

```bash
npm run validate:scene -- specs/samples/solar-system-no-moon.json
```

That should also succeed. Any moon whose `centerBodyId` points to a missing body will
fail fast with a descriptive error before scene initialisation.

## Run the Test Suite

```bash
npm test
```

Expected: 27 test files, all passing (unit, integration, and contract suites).

To run only the 004-related integration tests:

```bash
npm run test:integration
npm run test:contract
```

## Launch the Demo

```bash
npm run demo
```

The demo opens in the browser at `http://localhost:5173` (Vite default port).

The default scene is the full 10-body system. The status bar at the top shows:

```
Date: 2000-01-01 | Earth: 0 orb | Moon: 0 orb | Speed: 1.000 d/s | Mode: Orbital (sun) | Fwd: -Z
```

## Scene Variants

Append a `?scene=` query parameter to the URL to switch scenes:

| URL parameter      | Scene loaded                         | Body count |
|--------------------|--------------------------------------|------------|
| `?scene=complete`  | Full solar system with Earth's Moon  | 10         |
| `?scene=no-moon`   | Solar system without Earth's Moon    | 9          |
| `?scene=custom`    | Extension example with a custom body | 11+        |

Example: `http://localhost:5173/?scene=no-moon`

## Controls

### Time scale
| Key       | Effect                                    |
|-----------|-------------------------------------------|
| `+` / `=` | Double the simulation speed               |
| `-` / `_` | Halve the simulation speed                |
| `0`       | Reset to 1 simulated day per real second  |

### Navigation
| Input             | Effect                                           |
|-------------------|--------------------------------------------------|
| Mouse wheel       | Zoom in / out                                    |
| `W A S D`         | Move camera forward / left / backward / right (free mode) |
| `Q` / `E`         | Move camera up / down (free mode)                |
| Left-click + drag | Look around (free mode)                          |
| **Free** button   | Switch to free-flight camera                     |
| **Orbital** button| Switch to orbital camera locked on the Sun       |

## Manual Verification Checklist

After launching the demo, confirm the following:

- [ ] Status bar displays a simulated date near 2000-01-01 on first load.
- [ ] Earth orbit counter increments after approximately 365 simulated days.
- [ ] Moon orbit counter increments roughly every 27 simulated days.
- [ ] The Sun sits at the scene origin.
- [ ] All 8 planets orbit at visibly distinct radii; Mercury is fastest, Neptune slowest.
- [ ] Earth's Moon follows Earth rather than orbiting the Sun independently.
- [ ] Mouse wheel zooms from close-up (inner solar system) to full-system view.
- [ ] Switching to `?scene=no-moon` removes the Moon; all 9 bodies still render.
- [ ] Time scale doubles / halves correctly with `+` / `-` and resets with `0`.

## Troubleshooting

- If validation fails, check the contract in
  `specs/004-solar-system-data/contracts/solar-system-config.contract.md`
  and verify the body `type`, `centerBodyId`, and Keplerian orbital fields.
- If the demo does not load the scene, verify the query parameter spelling
  (`complete`, `no-moon`, `custom`) and confirm Vite can resolve the JSON imports.
- If the Moon appears to orbit the Sun, check that `centerBodyId: "earth"` is present
  in the Moon body definition and that the simulation processes bodies in dependency order.
