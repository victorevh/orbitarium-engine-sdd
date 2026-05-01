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

  it("accepts a valid Keplerian body", () => {
    const scene = structuredClone(minimalScene);
    scene.bodies[1].orbit = {
      model: "keplerian",
      centerBodyId: "sun-1",
      semiMajorAxisAU: 1,
      eccentricity: 0.0167,
      inclinationDeg: 0,
      longitudeAscendingNodeDeg: 0,
      argumentPeriapsisDeg: 0,
      meanAnomalyEpochDeg: 0,
      angularSpeed: 0.01,
    };

    const result = validateSceneConfiguration(scene);

    expect(result.valid).toBe(true);
  });

  it("rejects invalid Keplerian orbital values", () => {
    const scene = structuredClone(minimalScene);
    scene.bodies[1].orbit = {
      model: "keplerian",
      centerBodyId: "sun-1",
      semiMajorAxisAU: 1,
      eccentricity: 1,
      inclinationDeg: 0,
      longitudeAscendingNodeDeg: 0,
      argumentPeriapsisDeg: 0,
      meanAnomalyEpochDeg: 0,
      angularSpeed: 0.01,
    };

    const highEccentricityResult = validateSceneConfiguration(scene);

    expect(highEccentricityResult.valid).toBe(false);
    expect(highEccentricityResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.bodies[1].orbit.eccentricity",
        }),
      ]),
    );

    scene.bodies[1].orbit.eccentricity = -0.1;

    const negativeEccentricityResult = validateSceneConfiguration(scene);

    expect(negativeEccentricityResult.valid).toBe(false);
    expect(negativeEccentricityResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.bodies[1].orbit.eccentricity",
        }),
      ]),
    );
  });

  it("rejects missing Keplerian fields and invalid axial rotation values", () => {
    const missingSemiMajorAxisScene = structuredClone(minimalScene);
    missingSemiMajorAxisScene.bodies[1].orbit = {
      model: "keplerian",
      centerBodyId: "sun-1",
      eccentricity: 0.0167,
      inclinationDeg: 0,
      longitudeAscendingNodeDeg: 0,
      argumentPeriapsisDeg: 0,
      meanAnomalyEpochDeg: 0,      angularSpeed: 0.01,    };

    const missingSemiMajorAxisResult = validateSceneConfiguration(missingSemiMajorAxisScene);
    expect(missingSemiMajorAxisResult.valid).toBe(false);
    expect(missingSemiMajorAxisResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.bodies[1].orbit.semiMajorAxisAU",
        }),
      ]),
    );

    const invalidAxialRotationScene = structuredClone(minimalScene);
    invalidAxialRotationScene.bodies[1].orbit = {
      model: "keplerian",
      centerBodyId: "sun-1",
      semiMajorAxisAU: 1,
      eccentricity: 0.0167,
      inclinationDeg: 0,
      longitudeAscendingNodeDeg: 0,
      argumentPeriapsisDeg: 0,
      meanAnomalyEpochDeg: 0,
      angularSpeed: 0.01,
    };
    invalidAxialRotationScene.bodies[1].axialRotation = {
      siderealPeriodDays: -1,
      axialTiltDeg: 200,
    };

    const invalidAxialRotationResult = validateSceneConfiguration(invalidAxialRotationScene);

    expect(invalidAxialRotationResult.valid).toBe(false);
    expect(invalidAxialRotationResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "$.bodies[1].axialRotation.siderealPeriodDays",
        }),
        expect.objectContaining({
          path: "$.bodies[1].axialRotation.axialTiltDeg",
        }),
      ]),
    );
  });
});
