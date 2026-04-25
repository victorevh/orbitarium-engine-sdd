import { describe, expect, it, vi } from "vitest";
import { EngineHandle } from "../../src/core/engine/engine-handle";
import { TestTimeSource } from "../helpers/test-time-source";
import minimalScene from "../fixtures/minimal-scene.json";

describe("navigation modes integration", () => {
  it("switches free to orbital with deterministic time progression", () => {
    vi.useFakeTimers();

    const handle = new EngineHandle({ timeSource: new TestTimeSource(0, 1 / 60) });
    const result = handle.loadScene(minimalScene);
    expect(result.valid).toBe(true);

    const container = { nodeType: 1 } as unknown as HTMLElement;
    handle.start(container);

    handle.setNavigationMode("orbital", { targetBodyId: "sun-1" });
    vi.advanceTimersByTime(32);

    const state = handle.getNavigationState();
    expect(state.mode).toBe("orbital");
    expect(state.lastUpdateTick).toBeGreaterThan(0);

    handle.setNavigationMode("free");
    vi.advanceTimersByTime(16);

    expect(handle.getNavigationState().mode).toBe("free");
    handle.stop();
    vi.useRealTimers();
  });
});
