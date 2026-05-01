import { describe, expect, it } from "vitest";
import { EngineHandle } from "../../src/core/engine/engine-handle";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * Solar system scene load integration tests (T011)
 * 
 * Verifies that EngineHandle can load the complete 10-body scene
 * and that bodyStates are properly populated for all bodies.
 */

describe("solar system scene initialization", () => {
  it("EngineHandle.loadScene accepts solar-system-complete configuration", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => engine.loadScene(solarSystemComplete as any)).not.toThrow();
  });

  it("loaded scene provides bodyStates for all 10 bodies", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();

    expect(bodyStates).toBeDefined();
    expect(Object.keys(bodyStates)).toHaveLength(10);
  });

  it("bodyStates contains sun, 8 planets, and moon", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();
    const expectedBodies = [
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

    expectedBodies.forEach((bodyId) => {
      expect(bodyStates[bodyId]).toBeDefined();
    });
  });

  it("each body state has position and rotation", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();

    Object.entries(bodyStates).forEach(([bodyId, state]) => {
      expect(state.positionAU).toBeDefined();
      expect(state.positionAU.x).toBeDefined();
      expect(state.positionAU.y).toBeDefined();
      expect(state.positionAU.z).toBeDefined();

      expect(state.rotationAngle).toBeDefined();
      expect(state.rotationAxis).toBeDefined();
      expect(state.rotationAxis.x).toBeDefined();
      expect(state.rotationAxis.y).toBeDefined();
      expect(state.rotationAxis.z).toBeDefined();
    });
  });

  it("positions are finite for all bodies", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();

    Object.entries(bodyStates).forEach(([bodyId, state]) => {
      expect(isFinite(state.positionAU.x)).toBe(true);
      expect(isFinite(state.positionAU.y)).toBe(true);
      expect(isFinite(state.positionAU.z)).toBe(true);
    });
  });

  it("rotation quaternions are normalized for all bodies", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();

    Object.entries(bodyStates).forEach(([bodyId, state]) => {
      const axis = state.rotationAxis;
      // Rotation axis should be a unit vector (or zero for non-rotating bodies)
      const magnitude = Math.sqrt(axis.x ** 2 + axis.y ** 2 + axis.z ** 2);

      // Either it's a unit vector or it's a zero vector (no rotation)
      if (magnitude > 0) {
        expect(magnitude).toBeCloseTo(1.0, 5);
      }
    });
  });

  it("sun is positioned at or near origin", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();
    const sun = bodyStates["sun"];

    expect(Math.abs(sun.positionAU.x)).toBeLessThan(0.01);
    expect(Math.abs(sun.positionAU.y)).toBeLessThan(0.01);
    expect(Math.abs(sun.positionAU.z)).toBeLessThan(0.01);
  });

  it("planets orbit at expected distances from sun", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();

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

      const state = bodyStates[planetId];
      if (!state) {
        return; // Skip if body not found
      }
      const distance = Math.sqrt(
        state.positionAU.x ** 2 + state.positionAU.y ** 2 + state.positionAU.z ** 2,
      );

      expect(distance).toBeGreaterThanOrEqual(minDist);
      expect(distance).toBeLessThanOrEqual(maxDist);
    });
  });

  it("moon is positioned relative to earth with correct binding distance", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    const bodyStates = engine.getBodyStates();
    const moon = bodyStates["moon"];
    const earth = bodyStates["earth"];

    // Moon should be ~0.0026 AU from Earth
    const distance = Math.sqrt(
      (moon.positionAU.x - earth.positionAU.x) ** 2 +
        (moon.positionAU.y - earth.positionAU.y) ** 2 +
        (moon.positionAU.z - earth.positionAU.z) ** 2,
    );

    expect(distance).toBeGreaterThan(0.002);
    expect(distance).toBeLessThan(0.003);
  });

  it("update cycle maintains body state consistency", () => {
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.loadScene(solarSystemComplete as any);

    // Get initial state
    const initialStates = engine.getBodyStates();
    const initialMoonPos = {
      x: initialStates["moon"].positionAU.x,
      y: initialStates["moon"].positionAU.y,
      z: initialStates["moon"].positionAU.z,
    };

    // Advance time
    engine.update(1.0); // 1 second = 1 day with default scale

    const updatedStates = engine.getBodyStates();
    const updatedMoonPos = {
      x: updatedStates["moon"].positionAU.x,
      y: updatedStates["moon"].positionAU.y,
      z: updatedStates["moon"].positionAU.z,
    };

    // Moon position should change
    const posDelta = Math.sqrt(
      (updatedMoonPos.x - initialMoonPos.x) ** 2 +
        (updatedMoonPos.y - initialMoonPos.y) ** 2 +
        (updatedMoonPos.z - initialMoonPos.z) ** 2,
    );

    expect(posDelta).toBeGreaterThan(0);

    // Still all finite
    const finalStates = engine.getBodyStates();
    Object.entries(finalStates).forEach(([bodyId, state]) => {
      expect(isFinite(state.positionAU.x)).toBe(true);
      expect(isFinite(state.positionAU.y)).toBe(true);
      expect(isFinite(state.positionAU.z)).toBe(true);
    });
  });
});
