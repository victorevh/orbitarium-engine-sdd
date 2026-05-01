import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { createScaleTransform } from "../../src/core/simulation/scale-mapping";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * T028 [US4] — Scale proportions verification
 *
 * Verifies that render-unit distances and body size ratios are proportional
 * to real astronomical values within the ±20% visual tolerance defined in
 * the spec (SC-005).
 */

const RENDER_UNITS_PER_AU = solarSystemComplete.scaleProfile.renderUnitsPerAU; // 100

// NASA/JPL semi-major axes in AU used as reference ratios
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

const DISTANCE_RATIO_TOLERANCE = 0.2; // ±20% per spec SC-005

describe("scale proportions verification (T028)", () => {
  it("render-unit distance equals AU distance × renderUnitsPerAU for every planet", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (const bodyId of Object.keys(SEMI_MAJOR_AU)) {
      const state = snapshot.bodyStates[bodyId];
      expect(state, `${bodyId} must have a body state`).toBeDefined();

      const auDist = Math.sqrt(
        state.positionAU.x ** 2 + state.positionAU.y ** 2 + state.positionAU.z ** 2,
      );
      const renderPos = scaleTransform.auToRender(state.positionAU);
      const renderDist = Math.sqrt(
        renderPos.x ** 2 + renderPos.y ** 2 + renderPos.z ** 2,
      );

      // Render distance must be exactly AU distance × scale factor
      expect(renderDist).toBeCloseTo(auDist * RENDER_UNITS_PER_AU, 5);
    }
  });

  it("orbital distance ratios between consecutive planets are preserved within ±20% in render space", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    const pairs: Array<[string, string]> = [
      ["mercury", "venus"],
      ["venus", "earth"],
      ["earth", "mars"],
      ["mars", "jupiter"],
      ["jupiter", "saturn"],
      ["saturn", "uranus"],
      ["uranus", "neptune"],
    ];

    for (const [inner, outer] of pairs) {
      const innerRender = scaleTransform.auToRender(snapshot.bodyStates[inner].positionAU);
      const outerRender = scaleTransform.auToRender(snapshot.bodyStates[outer].positionAU);

      const innerDist = Math.sqrt(innerRender.x ** 2 + innerRender.y ** 2 + innerRender.z ** 2);
      const outerDist = Math.sqrt(outerRender.x ** 2 + outerRender.y ** 2 + outerRender.z ** 2);

      // Outer planet is always farther than inner planet
      expect(outerDist).toBeGreaterThan(innerDist);

      // Ratio of render distances must match ratio of semi-major axes within ±20%
      const expectedRatio = SEMI_MAJOR_AU[outer] / SEMI_MAJOR_AU[inner];
      const actualRatio = outerDist / innerDist;
      expect(actualRatio).toBeGreaterThan(expectedRatio * (1 - DISTANCE_RATIO_TOLERANCE));
      expect(actualRatio).toBeLessThan(expectedRatio * (1 + DISTANCE_RATIO_TOLERANCE));
    }
  });

  it("body size ordering matches physical size hierarchy", () => {
    const bodies = solarSystemComplete.bodies;
    const sz = (id: string): number => bodies.find((b) => b.bodyId === id)?.size ?? 0;

    // Gas giants are larger than terrestrial planets
    expect(sz("jupiter")).toBeGreaterThan(sz("earth"));
    expect(sz("saturn")).toBeGreaterThan(sz("earth"));
    expect(sz("uranus")).toBeGreaterThan(sz("earth"));
    expect(sz("neptune")).toBeGreaterThan(sz("earth"));

    // Earth is larger than Moon and inner planets
    expect(sz("earth")).toBeGreaterThan(sz("moon"));
    expect(sz("earth")).toBeGreaterThan(sz("mercury"));

    // Jupiter is the largest planet
    expect(sz("jupiter")).toBeGreaterThan(sz("saturn"));
  });

  it("Jupiter-to-Earth size ratio matches real value within ±20%", () => {
    const bodies = solarSystemComplete.bodies;
    const jupiterSize = bodies.find((b) => b.bodyId === "jupiter")?.size ?? 0;
    const earthSize = bodies.find((b) => b.bodyId === "earth")?.size ?? 1;

    const actualRatio = jupiterSize / earthSize;
    const expectedRatio = 11.21; // Jupiter radius in Earth radii

    expect(actualRatio).toBeGreaterThan(expectedRatio * 0.8);
    expect(actualRatio).toBeLessThan(expectedRatio * 1.2);
  });

  it("Earth-to-Moon size ratio is within expected range", () => {
    const bodies = solarSystemComplete.bodies;
    const earthSize = bodies.find((b) => b.bodyId === "earth")?.size ?? 1;
    const moonSize = bodies.find((b) => b.bodyId === "moon")?.size ?? 0;

    // Moon radius is ~0.2724 × Earth radius → ratio ≈ 3.67
    const ratio = earthSize / moonSize;
    expect(ratio).toBeGreaterThan(3.0);
    expect(ratio).toBeLessThan(5.0);
  });
});
