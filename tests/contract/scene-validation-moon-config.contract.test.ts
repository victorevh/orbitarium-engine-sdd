import { describe, expect, it } from "vitest";
import { validateSceneConfiguration } from "../../src/core/validation/scene-validator";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

describe("scene validation moon parent contract", () => {
  it("accepts a moon with a planet parent", () => {
    const scene = structuredClone(solarSystemComplete);

    const result = validateSceneConfiguration(scene);

    expect(result.valid).toBe(true);
  });

  it("rejects moon parent when parent is not a planet", () => {
    const scene = structuredClone(solarSystemComplete);
    const moon = scene.bodies.find((body) => body.bodyId === "moon");
    if (!moon) {
      throw new Error("Expected moon body in solar-system-complete fixture");
    }

    moon.orbit.centerBodyId = "sun";

    const result = validateSceneConfiguration(scene);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.message.includes("must reference a planet parent body"))).toBe(true);
  });

  it("rejects moon parent when referenced parent body does not exist", () => {
    const scene = structuredClone(solarSystemComplete);
    const moon = scene.bodies.find((body) => body.bodyId === "moon");
    if (!moon) {
      throw new Error("Expected moon body in solar-system-complete fixture");
    }

    moon.orbit.centerBodyId = "missing-planet";

    const result = validateSceneConfiguration(scene);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.message.includes("must reference an existing parent body"))).toBe(true);
  });
});
