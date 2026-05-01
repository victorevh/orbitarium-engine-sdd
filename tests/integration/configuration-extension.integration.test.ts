import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { EngineHandle } from "../../src/core/engine/engine-handle";

const CUSTOM_SCENE_PATH = "specs/samples/solar-system-custom-body.json";

const loadJson = (filePath: string): unknown => {
  if (!existsSync(filePath)) {
    throw new Error(`Expected custom scene fixture to exist: ${filePath}`);
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
};

describe("configuration extension", () => {
  it("loads a custom-body scene through JSON only", () => {
    const sceneConfig = loadJson(CUSTOM_SCENE_PATH);
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = engine.loadScene(sceneConfig as any);
    expect(result.valid).toBe(true);
  });

  it("custom-body scene includes at least one body beyond the canonical 10", () => {
    const sceneConfig = loadJson(CUSTOM_SCENE_PATH) as { bodies?: Array<{ bodyId: string }> };

    const canonicalIds = new Set([
      "sun",
      "mercury",
      "venus",
      "earth",
      "moon",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ]);

    const extraBodies = (sceneConfig.bodies ?? []).filter((body) => !canonicalIds.has(body.bodyId));

    expect(extraBodies.length).toBeGreaterThan(0);
  });

  it("custom-body scene produces simulation states for all configured bodies", () => {
    const sceneConfig = loadJson(CUSTOM_SCENE_PATH) as { bodies?: Array<{ bodyId: string }> };
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = engine.loadScene(sceneConfig as any);
    expect(result.valid).toBe(true);

    const configuredBodyCount = (sceneConfig.bodies ?? []).length;
    expect(Object.keys(engine.getBodyStates())).toHaveLength(configuredBodyCount);
  });
});
