# Research: Realistic Solar System Simulation

**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2026-04-30
**Status**: Complete — no NEEDS CLARIFICATION items remain.

---

## Decision 1: Kepler Equation Solver

**Decision**: Newton-Raphson iteration on the eccentric anomaly `E`, seeded from mean
anomaly `M` as the initial estimate.

```
Iterate: E_next = E - (E - e·sin(E) - M) / (1 - e·cos(E))
Until:   |E_next - E| < 1e-8  (or max 100 iterations)
```

**Rationale**: Converges in 5–10 iterations for all eccentricities present in the solar
system (no planet exceeds e ≈ 0.25). Position is computed from total elapsed simulated
time (`simTimeDays`), not accumulated step-by-step — so floating-point error does not
grow with simulation duration. Simple to unit-test with known (M, e, E, ν) tuples.

**Alternatives considered**:
- Halley's method: cubic convergence but more complex; not needed for e < 0.5.
- Fourier/Bessel series expansion: poor convergence for e > 0.1; not suitable.
- Direct lookup table: less precise; maintenance burden without benefit.

---

## Decision 2: Scale Factor and Coordinate System

**Decision**: Ecliptic plane mapped to the engine's XZ plane (Y = ecliptic north). AU is
the canonical simulation distance unit. `renderUnitsPerAU` (optional, default 100) converts
AU → Three.js world units.

1 AU = 100 render units → Mercury at ~39 units, Earth at 100, Neptune at ~3000.

**Rationale**: This range sits well inside Three.js's float32 GPU precision (~16M units).
JS uses float64 for all simulation math, so no precision concern at 3000 units.
Floating-origin is not required for solar-system scale and would add implementation
complexity with no measurable benefit.

**Alternatives considered**:
- 1 AU = 1 render unit: inner planets unresolvably close on screen.
- 1 AU = 1000 units: Neptune at 30 000; marginal float32 shader precision risk.
- Floating-origin: necessary for galactic-scale scenes; overkill here.

---

## Decision 3: Orbital Period Formula

**Decision**: Kepler's third law in natural units — `P_years = a_AU^1.5` — therefore
`P_days = 365.25 × a_AU^1.5`.

Mean anomaly at total simulated time T (days):
`M(T) = M₀_rad + 2π × T / P_days`

**Rationale**: Exact for two-body heliocentric orbits. Requires no `GM_sun` constant (it
reduces to 4π² AU³/year² in these units). Consistent with J2000 orbital elements.

**Validation**:
- Earth (a=1.000 AU) → P = 365.25 days ✓
- Mercury (a=0.387 AU) → P ≈ 87.97 days ✓
- Jupiter (a=5.203 AU) → P ≈ 4331 days (11.86 yr) ✓
- Neptune (a=30.07 AU) → P ≈ 60 190 days (164.8 yr) ✓

---

## Decision 4: Ecliptic-to-World Rotation Sequence

**Decision**: Convert Keplerian orbital elements to ecliptic-frame (XZ-plane) world position
using the standard perifocal → ecliptic rotation (IAU convention):

```
// 1. Position in perifocal frame (ν = true anomaly, r = orbital radius)
x_per = r × cos(ν)
y_per = r × sin(ν)
z_per = 0

// 2. Apply argument of periapsis ω (rotation around Z in perifocal frame)
// 3. Apply inclination i (rotation around X)
// 4. Apply longitude of ascending node Ω (rotation around Y, ecliptic north)

// Implemented as three successive quaternion rotations to avoid gimbal lock.
// Final result is a point in the engine's XZ ecliptic plane with Y = ecliptic north.
```

**Rationale**: Standard IAU sequence. Produces correct orbit orientation for all
inclinations, including i = 90°. Using quaternion composition avoids gimbal lock that
matrix Euler angles can produce at edge cases.

**Alternatives considered**:
- Direct matrix construction: equivalent but more verbose and harder to test.
- Simplified XZ-plane rotation (ignore Ω and ω): produces correct periods and distances
  but incorrect orbital-plane orientation. Rejected — inclination and node produce
  visually significant differences (e.g., Pluto, inclined moons).

---

## Decision 5: Axial Rotation Representation

**Decision**: `axialTiltDeg` defines the angle from ecliptic north (Y-axis) to the body's
rotation pole, lying in the XY plane.

```
rotationAxis = (sin(tiltRad), cos(tiltRad), 0)   // normalized
rotationAngle(T) = initialPhaseDeg × (π/180) + 2π × T / siderealPeriodDays
```

**Rationale**: Single-parameter tilt is sufficient for visual plausibility at this feature's
scope. Real bodies have a longitude-of-pole parameter, but for a solar system overview the
tilt angle alone produces the correct visual effect of an inclined axis. The XY-plane
assumption simplifies calculation and testing.

**Alternatives considered**:
- Full pole longitude + tilt (two parameters): more accurate but adds schema complexity
  and does not materially improve the visual outcome at solar-system overview scale.

---

## Decision 6: Time Scale Design

**Decision**: `simDaysPerRealSecond` scalar stored in `SceneConfiguration.timeScale`. The
`SimulationSystem` accumulates `simTimeDays += deltaSeconds × simDaysPerRealSecond` each
tick. Mutable at runtime via `SimulationSystem.setTimeScale(rate)`.

Default (if `timeScale` absent from scene): `simDaysPerRealSecond = 1.0`.

**Rationale**: Accumulated `simTimeDays` is the single source of truth for all orbital and
rotation positions. Time scale changes take effect from the next tick with no positional
discontinuity — because positions are computed from total `simTimeDays`, changing the rate
only affects how fast future ticks accumulate simulated days.

**Alternatives considered**:
- Scale `deltaSeconds` inside a wrapper `TimeSource`: would require a new `TimeSource`
  implementation and would conflate real seconds (used by navigation) with simulated time.
  Rejected — navigation uses `TimeContext.deltaSeconds` for camera movement speed, which
  must remain in real seconds.

---

## Decision 7: Backward Compatibility and Snapshot Design

**Decision**: Additive schema and snapshot changes only. No existing field is removed or
changed in semantics.

**Schema additions** (all optional):
- `ScaleProfile.renderUnitsPerAU?: number` (default 100)
- `SceneConfiguration.timeScale?: TimeScaleConfig`
- `OrbitModel` union extended with `"keplerian"` variant
- `CelestialBodyDefinition.axialRotation?: AxialRotation`

**Snapshot additions**:
- `SimulationSnapshot.bodyStates: Record<string, SimBodyState>` — populated for Keplerian
  bodies only; carries AU-space position and rotation state.
- `SimulationSnapshot.simulatedDays: number` — total elapsed simulated time.
- `SimulationSnapshot.bodyPositions` — unchanged; populated for circular/elliptical bodies
  only; not populated for Keplerian bodies.

**Known technical debt**: `bodyPositions` for circular/elliptical bodies mixes simulation
units and render units (a pre-existing condition of the codebase). The `bodyStates` /
`ScaleTransform` pattern established by this feature provides the migration path for future
unification.

**Rationale**: The existing `minimal-scene.json` fixture and all existing tests pass without
modification. New solar system scene uses Keplerian model and populates only `bodyStates`.

---

## Resolved Clarifications

None — the user input and existing codebase provided sufficient context for all decisions.
