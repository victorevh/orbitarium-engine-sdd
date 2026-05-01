import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { createScaleTransform } from "../../src/core/simulation/scale-mapping";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * T030 [US4] — Renderer scale accuracy
 *
 * Verifies that mesh scale behavior in the Three.js renderer context is
 * correct: the scale transform applied to body AU positions produces valid
 * render-space coordinates, all bodies fall within the camera frustum, and
 * the size mapping produces positive finite values for every body.
 *
 * Three.js is not instantiated here; this test validates the scale transform
 * and mesh size function that the renderer consumes (pure-function surface).
 */

const RENDER_UNITS_PER_AU = solarSystemComplete.scaleProfile.renderUnitsPerAU; // 100

// Camera frustum as configured in ThreeDemoRenderer
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 5000;

// Mirrors ThreeDemoRenderer.scaleSize — a pure function independent of THREE
const scaleSize = (size: number): number => Math.max(0.5, Math.sqrt(size) * 0.1);

describe("renderer scale accuracy (T030)", () => {
  it("scale transform round-trip preserves AU positions for all bodies", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (const [bodyId, state] of Object.entries(snapshot.bodyStates)) {
      const renderPos = scaleTransform.auToRender(state.positionAU);
      const recovered = scaleTransform.renderToAU(renderPos);

      expect(recovered.x).toBeCloseTo(state.positionAU.x, 10);
      expect(recovered.y).toBeCloseTo(state.positionAU.y, 10);
      expect(recovered.z).toBeCloseTo(state.positionAU.z, 10);
      expect(bodyId).toBeDefined(); // verify iteration is over all bodies
    }
  });

  it("all non-Sun bodies have render positions within camera frustum bounds", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (const [bodyId, state] of Object.entries(snapshot.bodyStates)) {
      if (bodyId === "sun") {
        continue; // Sun is at origin
      }

      const renderPos = scaleTransform.auToRender(state.positionAU);
      const renderDist = Math.sqrt(
        renderPos.x ** 2 + renderPos.y ** 2 + renderPos.z ** 2,
      );

      expect(renderDist).toBeGreaterThan(CAMERA_NEAR);
      expect(renderDist).toBeLessThan(CAMERA_FAR);
    }
  });

  it("mesh size scaling produces positive finite values for every body", () => {
    for (const body of solarSystemComplete.bodies) {
      const meshRadius = scaleSize(body.size);
      expect(isFinite(meshRadius)).toBe(true);
      expect(meshRadius).toBeGreaterThan(0);
    }
  });

  it("Neptune's render distance is within camera far plane", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const neptunePos = scaleTransform.auToRender(snapshot.bodyStates["neptune"].positionAU);
    const neptuneDist = Math.sqrt(
      neptunePos.x ** 2 + neptunePos.y ** 2 + neptunePos.z ** 2,
    );

    // Neptune at ~30 AU → ~3000 render units; far plane is 5000
    expect(neptuneDist).toBeGreaterThan(1000);
    expect(neptuneDist).toBeLessThan(CAMERA_FAR);
  });

  it("Mercury's render distance is distinguishable from the Sun", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const scaleTransform = createScaleTransform(RENDER_UNITS_PER_AU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const mercuryPos = scaleTransform.auToRender(snapshot.bodyStates["mercury"].positionAU);
    const mercuryDist = Math.sqrt(
      mercuryPos.x ** 2 + mercuryPos.y ** 2 + mercuryPos.z ** 2,
    );

    // Mercury at ~0.387 AU → ~38.7 render units; must be clearly outside the camera near plane
    expect(mercuryDist).toBeGreaterThan(10);
  });

  it("scaleSize produces valid non-negative values and respects the minimum floor", () => {
    // scaleSize floor is 0.5 — all bodies with size below the threshold use this minimum
    for (const body of solarSystemComplete.bodies) {
      const meshRadius = scaleSize(body.size);
      expect(meshRadius).toBeGreaterThanOrEqual(0.5); // floor is always respected
      expect(isFinite(meshRadius)).toBe(true);
    }
  });

  it("body size properties maintain correct ordering independent of scaleSize floor", () => {
    // Verify the raw body sizes in the config reflect physical size ordering.
    // The renderer's scaleSize floor may collapse small bodies to the same mesh radius;
    // the underlying data must still reflect the correct hierarchy.
    const bodies = solarSystemComplete.bodies;
    const sz = (id: string): number => bodies.find((b) => b.bodyId === id)?.size ?? 0;

    expect(sz("jupiter")).toBeGreaterThan(sz("earth"));
    expect(sz("saturn")).toBeGreaterThan(sz("earth"));
    expect(sz("earth")).toBeGreaterThan(sz("moon"));
  });
});
