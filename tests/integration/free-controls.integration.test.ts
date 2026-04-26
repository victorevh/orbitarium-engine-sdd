import { describe, expect, it, vi } from "vitest";
import { EngineHandle } from "../../src/core/engine/engine-handle";
import { TestTimeSource } from "../helpers/test-time-source";
import minimalScene from "../fixtures/minimal-scene.json";

describe("free mode control mapping integration", () => {
  it("keeps navigation stable in free mode with neutral input", () => {
    vi.useFakeTimers();

    const handle = new EngineHandle({ timeSource: new TestTimeSource(0, 1 / 60) });
    const result = handle.loadScene(minimalScene);
    expect(result.valid).toBe(true);

    const container = { nodeType: 1 } as unknown as HTMLElement;
    handle.start(container);

    const before = handle.getNavigationState();
    expect(before.mode).toBe("free");

    vi.advanceTimersByTime(48);

    const after = handle.getNavigationState();
    expect(after.mode).toBe("free");
    expect(after.orbitalTargetBodyId).toBeUndefined();
    expect(after.position).toEqual(before.position);
    expect(after.orientation).toEqual(before.orientation);
    expect(after.lastUpdateTick).toBeGreaterThan(before.lastUpdateTick);

    handle.stop();
    vi.useRealTimers();
  });

  it.todo("maps W/S to camera-relative forward/backward translation in free mode");
  it.todo("maps A/D to camera-relative left/right translation in free mode");
  it.todo("maps Q/E to camera-relative vertical translation in free mode");
  it.todo("maps mouse movement to free-mode camera rotation");
});
