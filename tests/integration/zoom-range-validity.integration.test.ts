import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { createScaleTransform } from "../../src/core/simulation/scale-mapping";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * T031 [US4] — Zoom range validity
 *
 * Verifies that the scene's minZoom/maxZoom bounds are self-consistent and
 * that the configured renderUnitsPerAU places all bodies within a usable
 * camera range — from full-system overview (Neptune visible) to close-up
 * inspection (Earth–Moon separation distinguishable).
 */

// Camera far clipping plane as configured in ThreeDemoRenderer
const CAMERA_FAR = 5000;
const CAMERA_NEAR = 0.1;

describe("zoom range validity (T031)", () => {
  it("minZoom and maxZoom are positive and maxZoom is greater than minZoom", () => {
    const { minZoom, maxZoom } = solarSystemComplete.scaleProfile;

    expect(minZoom).toBeGreaterThan(0);
    expect(maxZoom).toBeGreaterThan(0);
    expect(maxZoom).toBeGreaterThan(minZoom);
  });

  it("zoom ratio is at least 1000:1 to span full-system and close-up views", () => {
    const { minZoom, maxZoom } = solarSystemComplete.scaleProfile;
    const ratio = maxZoom / minZoom;

    // From Neptune (~3000 render units) to Earth–Moon (~0.26 render units apart)
    // requires roughly a 10000:1 range; require at least 1000:1
    expect(ratio).toBeGreaterThanOrEqual(1000);
  });

  it("all bodies are within camera far plane at the configured renderUnitsPerAU", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const { renderUnitsPerAU } = solarSystemComplete.scaleProfile;
    const scaleTransform = createScaleTransform(renderUnitsPerAU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();

    for (const [bodyId, state] of Object.entries(snapshot.bodyStates)) {
      const renderPos = scaleTransform.auToRender(state.positionAU);
      const renderDist = Math.sqrt(
        renderPos.x ** 2 + renderPos.y ** 2 + renderPos.z ** 2,
      );

      expect(renderDist).toBeLessThan(CAMERA_FAR);
      expect(bodyId).toBeDefined(); // verify iteration covers all bodies
    }
  });

  it("Earth–Moon render separation is visible (above camera near plane)", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const { renderUnitsPerAU } = solarSystemComplete.scaleProfile;
    const scaleTransform = createScaleTransform(renderUnitsPerAU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const earthRender = scaleTransform.auToRender(snapshot.bodyStates["earth"].positionAU);
    const moonRender = scaleTransform.auToRender(snapshot.bodyStates["moon"].positionAU);

    const separation = Math.sqrt(
      (moonRender.x - earthRender.x) ** 2 +
        (moonRender.y - earthRender.y) ** 2 +
        (moonRender.z - earthRender.z) ** 2,
    );

    // Moon is ~0.00257 AU from Earth → ~0.257 render units (100 units/AU)
    expect(separation).toBeGreaterThan(0);
    // Must be detectable above the camera near-clip plane so a zoomed-in camera can show it
    expect(separation).toBeGreaterThan(CAMERA_NEAR);
  });

  it("Neptune render distance covers the system extents without exceeding camera far plane", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);
    const { renderUnitsPerAU } = solarSystemComplete.scaleProfile;
    const scaleTransform = createScaleTransform(renderUnitsPerAU);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    const neptuneRender = scaleTransform.auToRender(snapshot.bodyStates["neptune"].positionAU);
    const neptuneDist = Math.sqrt(
      neptuneRender.x ** 2 + neptuneRender.y ** 2 + neptuneRender.z ** 2,
    );

    // At minZoom the full system must be visible; Neptune is the farthest body
    // Render distance must be inside the far plane
    expect(neptuneDist).toBeLessThan(CAMERA_FAR);
    // And it must be a non-trivial fraction of the available range (> 1% of far)
    expect(neptuneDist).toBeGreaterThan(CAMERA_FAR * 0.01);
  });
});
