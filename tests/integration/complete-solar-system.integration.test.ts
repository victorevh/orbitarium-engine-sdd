import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * Complete solar system integration tests (T009)
 * 
 * Verifies that the 10-body solar system loads, initializes,
 * and produces valid simulation states for all bodies.
 */

const EXPECTED_BODY_COUNT = 10;
const EXPECTED_BODIES = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "moon",
];

describe("complete solar system integration", () => {
  it("loads solar-system-complete.json without errors", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // Should not throw
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => sim.applyScene(solarSystemComplete as any)).not.toThrow();
  });

  it("contains exactly 10 bodies after loading complete scene", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const bodyCount = Object.keys(snapshot.bodyStates).length;

    expect(bodyCount).toBe(EXPECTED_BODY_COUNT);
  });

  it("contains all expected body IDs", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const bodyIds = Object.keys(snapshot.bodyStates);

    EXPECTED_BODIES.forEach((expectedId) => {
      expect(bodyIds).toContain(expectedId);
    });
  });

  it("all bodies have finite position states after loading", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    Object.entries(snapshot.bodyStates).forEach(([bodyId, state]) => {
      expect(isFinite(state.positionAU.x)).toBe(true);
      expect(isFinite(state.positionAU.y)).toBe(true);
      expect(isFinite(state.positionAU.z)).toBe(true);
      expect(`${bodyId}: position is finite`);
    });
  });

  it("sun remains at origin", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const sunState = snapshot.bodyStates["sun"];

    // Sun is the central reference point
    expect(sunState.positionAU.x).toBeCloseTo(0, 5);
    expect(sunState.positionAU.y).toBeCloseTo(0, 5);
    expect(sunState.positionAU.z).toBeCloseTo(0, 5);
  });

  it("planets orbit at their expected approximate distances from sun", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    // Expected approximate orbital radii in AU
    const expectedDistances: Record<string, [number, number]> = {
      mercury: [0.3, 0.47],
      venus: [0.718, 0.728],
      earth: [0.983, 1.017],
      mars: [1.38, 1.67],
      jupiter: [4.95, 5.46],
      saturn: [9.0, 10.0],
      uranus: [18.3, 20.1],
      neptune: [29.8, 30.3],
    };

    Object.entries(expectedDistances).forEach(([planetId, [minDist, maxDist]]) => {
      const state = snapshot.bodyStates[planetId];
      const distance = Math.sqrt(
        state.positionAU.x ** 2 + state.positionAU.y ** 2 + state.positionAU.z ** 2,
      );

      expect(distance).toBeGreaterThanOrEqual(minDist);
      expect(distance).toBeLessThanOrEqual(maxDist);
    });
  });

  it("moon is within expected distance from earth", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const moonState = snapshot.bodyStates["moon"];
    const earthState = snapshot.bodyStates["earth"];

    // Moon is ~0.0026 AU from Earth
    const moonToEarthDistance = Math.sqrt(
      (moonState.positionAU.x - earthState.positionAU.x) ** 2 +
        (moonState.positionAU.y - earthState.positionAU.y) ** 2 +
        (moonState.positionAU.z - earthState.positionAU.z) ** 2,
    );

    expect(moonToEarthDistance).toBeGreaterThan(0.002);
    expect(moonToEarthDistance).toBeLessThan(0.003);
  });

  it("all 10 bodies have valid finite rotation states", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    Object.entries(snapshot.bodyStates).forEach(([bodyId, state]) => {
      expect(state.rotationAngle).toBeDefined();
      expect(state.rotationAxis).toBeDefined();
      expect(isFinite(state.rotationAxis.x)).toBe(true);
      expect(isFinite(state.rotationAxis.y)).toBe(true);
      expect(isFinite(state.rotationAxis.z)).toBe(true);
    });
  });
});
