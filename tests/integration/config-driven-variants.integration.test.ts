import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { EngineHandle } from "../../src/core/engine/engine-handle";

const NO_MOON_SCENE_PATH = "specs/samples/solar-system-no-moon.json";

const loadJson = (filePath: string): unknown => {
  if (!existsSync(filePath)) {
    throw new Error(`Expected scene fixture to exist: ${filePath}`);
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
};

describe("config-driven variants", () => {
  it("loads the no-moon variant scene from JSON", () => {
    const sceneConfig = loadJson(NO_MOON_SCENE_PATH);
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = engine.loadScene(sceneConfig as any);
    expect(result.valid).toBe(true);
  });

  it("no-moon variant contains 9 bodies and no moon entry", () => {
    const sceneConfig = loadJson(NO_MOON_SCENE_PATH) as { bodies?: Array<{ bodyId: string }> };

    const bodyIds = (sceneConfig.bodies ?? []).map((body) => body.bodyId);

    expect(bodyIds).toHaveLength(9);
    expect(bodyIds).not.toContain("moon");
    expect(bodyIds).toContain("earth");
    expect(bodyIds).toContain("sun");
  });

  it("no-moon variant still produces simulation states for all configured bodies", () => {
    const sceneConfig = loadJson(NO_MOON_SCENE_PATH);
    const engine = new EngineHandle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = engine.loadScene(sceneConfig as any);
    expect(result.valid).toBe(true);

    const bodyStates = engine.getBodyStates();
    expect(Object.keys(bodyStates)).toHaveLength(9);
    expect(bodyStates["moon"]).toBeUndefined();
  });
});
