import { describe, expect, it } from "vitest";
import { validateSceneConfiguration } from "../../src/core/validation/scene-validator";

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
});
