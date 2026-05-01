# Quickstart: Realistic Solar System Simulation

**Date**: 2026-04-30
**Plan**: [plan.md](./plan.md)

## Goal

Load a realistic solar system scene with Keplerian orbits, verify that simulation and
render coordinates remain separated, confirm orbital period correctness, and run the demo
with time scaling.

## Prerequisites

- Node.js 22.x installed
- npm 10+ installed
- Desktop browser with WebGL2 support (Chrome 116+, Firefox 120+, Safari 17+)

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Run the full test suite

```bash
npm test
```

Expected outcomes:
- All pre-existing tests (navigation, time-source boundary, scene validation) continue
  to pass unchanged.
- New unit tests for `orbital-elements`, `scale-mapping`, `rotation-solver`, and
  `time-scale` pass.
- Integration tests confirm Earth completes one orbit within ±5% of 365 simulated days.
- Integration test confirms headless execution with no rendering context dependency.
- Updated contract test validates Keplerian scene configuration and rejects invalid
  orbital parameters (e.g., `eccentricity = 1`).

To run only physics unit tests:

```bash
npm run test:unit
```

To run only integration tests:

```bash
npm run test:integration
```

---

## 3. Validate the solar system scene fixture

```bash
npm run validate:scene -- specs/samples/solar-system.json
```

Expected outcomes:
- Validation passes with no errors.
- All 8 planets' Keplerian elements are accepted.
- Confirmation printed to stdout: scene ID, body count, time scale setting.

To confirm a bad config is rejected:

```bash
# Temporarily set eccentricity to 1.0 in the fixture, then run:
npm run validate:scene -- specs/samples/solar-system.json
# Expected: validation error listing the invalid eccentricity field
```

---

## 4. Run the interactive demo

```bash
npm run demo
```

Open the URL printed to the terminal (typically `http://localhost:5173`).

Expected visual behavior:
- The Sun sits at the origin.
- All 8 planets orbit the Sun with visible elliptical paths.
- Inner planets (Mercury, Venus, Earth, Mars) orbit noticeably faster than outer planets.
- Each body rotates on its tilted axis.
- The scene is stable — no jitter, no drift.

To change the time scale, open the browser console and call:

```javascript
// Access via the demo's global engine handle
window.__engine.setTimeScale(365.25);   // 1 year per real second
window.__engine.setTimeScale(1);        // 1 day per real second (default)
window.__engine.setTimeScale(0.001);    // near-pause
```

---

## 5. Manual acceptance checks

Run through each of these checks after the demo is running:

| Check | How to verify |
|---|---|
| Earth orbital period | At `simDaysPerRealSecond = 1`, Earth should complete one orbit in ~365 real seconds |
| Mercury vs Neptune ratio | Mercury should complete ~687 orbits per single Neptune orbit (observe relative speeds) |
| Elliptical speed variation | Earth should move visibly faster near perihelion (early January) than aphelion (early July) |
| Axial tilt | Earth's rotation axis should be visibly tilted ~23° from vertical |
| Time scale switch | Switching from 1 day/sec to 1 year/sec should produce no positional jump |
| Pause | `setTimeScale(0.001)` should nearly freeze all orbital and rotational motion |
| Stability at high speed | Run at 1000× for 60 real seconds (~165 simulated years); no body should drift away or produce NaN |
| Render/sim separation | Confirm via unit tests that `SimulationSystem` never imports from `scale-mapping.ts` |

---

## 6. Verify layer separation (automated)

The boundary test in `tests/unit/time-source-boundary.unit.test.ts` already enforces
that simulation files contain no direct wall-clock calls. An analogous structural test
should verify no `ScaleTransform` import appears under `src/core/simulation/`:

```bash
grep -r "scale-mapping" src/core/simulation/
# Expected: no output (zero matches)
```

---

## Troubleshooting

**Bodies not visible in demo**:
- Confirm `renderUnitsPerAU` is set to 100 in the scene fixture.
- Check browser console for scene validation errors.

**Orbital period off by large factor**:
- Verify `semiMajorAxisAU` is in AU (not km or other units).
- Check `simDaysPerRealSecond` setting.

**NaN positions after long run**:
- Check that `eccentricity < 1` for all bodies.
- Verify Newton-Raphson convergence in unit tests (`orbital-elements.unit.test.ts`).

**Existing tests fail after changes**:
- Confirm `bodyPositions` still populates for circular/elliptical bodies.
- Confirm `bodyStates` initializes as `{}` for scenes without Keplerian bodies.
- Confirm `simulatedDays` initializes to `0`.
