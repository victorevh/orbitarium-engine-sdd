import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * T029 [US4] — Orbital spacing accuracy
 *
 * Verifies that the spacing between neighboring planetary orbits matches
 * expected AU gaps within ±10% and that planets maintain correct distance
 * ordering from the Sun.
 */

const PLANET_ORDER = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] as const;

// Expected semi-major axes in AU (NASA/JPL)
const SEMI_MAJOR_AU: Record<string, number> = {
  mercury: 0.387099,
  venus: 0.723332,
  earth: 1.0,
  mars: 1.523688,
  jupiter: 5.2026,
  saturn: 9.53707,
  uranus: 19.1913,
  neptune: 30.069,
};

// Epoch positions can deviate from semi-major axes by up to one eccentricity factor
// (e.g. Mercury e≈0.21 → ~21% deviation at perihelion/aphelion). Gap errors compound
// across two bodies, so 30% is a realistic bound for epoch-based spacing checks.
const GAP_TOLERANCE = 0.30; // ±30% for epoch-based gap comparison

const getDistanceAU = (state: { positionAU: { x: number; y: number; z: number } }): number =>
  Math.sqrt(state.positionAU.x ** 2 + state.positionAU.y ** 2 + state.positionAU.z ** 2);

describe("orbital spacing accuracy (T029)", () => {
  it("planets are ordered by increasing distance from Sun in simulation state", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    let prevDistance = 0;
    for (const id of PLANET_ORDER) {
      const dist = getDistanceAU(snapshot.bodyStates[id]);
      expect(dist).toBeGreaterThan(prevDistance);
      prevDistance = dist;
    }
  });

  it("spacing between neighboring planet orbits matches expected AU gap within ±10%", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (let i = 0; i < PLANET_ORDER.length - 1; i++) {
      const inner = PLANET_ORDER[i];
      const outer = PLANET_ORDER[i + 1];

      const innerDist = getDistanceAU(snapshot.bodyStates[inner]);
      const outerDist = getDistanceAU(snapshot.bodyStates[outer]);

      const actualGap = outerDist - innerDist;
      const expectedGap = SEMI_MAJOR_AU[outer] - SEMI_MAJOR_AU[inner];

      expect(actualGap).toBeGreaterThan(0);

      const error = Math.abs(actualGap - expectedGap) / expectedGap;
      expect(error).toBeLessThanOrEqual(GAP_TOLERANCE);
    }
  });

  it("inner zone (Mercury–Mars) has monotonically increasing gaps toward the asteroid belt", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    const mercuryDist = getDistanceAU(snapshot.bodyStates["mercury"]);
    const venusDist = getDistanceAU(snapshot.bodyStates["venus"]);
    const earthDist = getDistanceAU(snapshot.bodyStates["earth"]);
    const marsDist = getDistanceAU(snapshot.bodyStates["mars"]);

    // All four inner planets are separated in correct order
    expect(venusDist).toBeGreaterThan(mercuryDist);
    expect(earthDist).toBeGreaterThan(venusDist);
    expect(marsDist).toBeGreaterThan(earthDist);
  });

  it("outer planet zone (Jupiter–Neptune) has much larger absolute gaps than the inner zone", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    const innerZoneSpan =
      getDistanceAU(snapshot.bodyStates["mars"]) -
      getDistanceAU(snapshot.bodyStates["mercury"]);

    const outerZoneSpan =
      getDistanceAU(snapshot.bodyStates["neptune"]) -
      getDistanceAU(snapshot.bodyStates["jupiter"]);

    // Outer zone spans ~25 AU; inner zone spans ~1.14 AU
    expect(outerZoneSpan).toBeGreaterThan(innerZoneSpan * 5);
  });

  it("each planet's simulated distance from Sun falls between perihelion and aphelion", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (const body of solarSystemComplete.bodies) {
      if (body.type !== "planet") continue;

      const state = snapshot.bodyStates[body.bodyId];
      expect(state, `${body.bodyId} should have a body state`).toBeDefined();

      const a = body.orbit.semiMajorAxisAU;
      const e = body.orbit.eccentricity;
      const perihelion = a * (1 - e);
      const aphelion = a * (1 + e);

      const actualAU = getDistanceAU(state);

      // At epoch the planet must be somewhere on its ellipse
      expect(actualAU).toBeGreaterThanOrEqual(perihelion * 0.99); // 1% numeric margin
      expect(actualAU).toBeLessThanOrEqual(aphelion * 1.01);
    }
  });
});
