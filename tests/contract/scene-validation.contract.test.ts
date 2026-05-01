import { describe, expect, it } from "vitest";
import { validateSceneConfiguration } from "../../src/core/validation/scene-validator";
import minimalScene from "../fixtures/minimal-scene.json";

describe("scene validation contract", () => {
  it("returns aggregated errors and blocks invalid scenes", () => {
    const invalidScene = {
      sceneId: "",
      name: "",
      coordinateSystem: "left-handed",
      scaleProfile: {
        minZoom: 10,
        maxZoom: 1,
      },
      bodies: [],
      lights: [],
    };

    const result = validateSceneConfiguration(invalidScene);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("allows star circular radius equal to zero", () => {
    const scene = structuredClone(minimalScene);
    scene.bodies[0].orbit = {
      ...scene.bodies[0].orbit,
      model: "circular",
      radius: 0,
    };

    const result = validateSceneConfiguration(scene);
    expect(result.valid).toBe(true);
  });

  it("rejects non-star circular radius equal to zero", () => {
    const scene = structuredClone(minimalScene);
    scene.bodies[1].orbit = {
      model: "circular",
      centerBodyId: "sun-1",
      radius: 0,
      angularSpeed: 0.01,
    };

    const result = validateSceneConfiguration(scene);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.message.includes("non-star bodies require orbit.radius > 0"))).toBe(true);
  });
});
