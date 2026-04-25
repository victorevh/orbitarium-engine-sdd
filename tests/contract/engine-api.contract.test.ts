import { describe, expect, it, vi } from "vitest";
import { EngineHandle } from "../../src/core/engine/engine-handle";
import type { TimeContext, TimeSource } from "../../src/core/time/time-source";
import minimalScene from "../fixtures/minimal-scene.json";

class DeterministicTimeSource implements TimeSource {
  private tick = 0;

  sample(): TimeContext {
    this.tick += 1;
    return {
      nowSeconds: this.tick / 60,
      deltaSeconds: 1 / 60,
      tick: this.tick,
    };
  }
}

describe("engine api contract", () => {
  it("supports TimeSource injection", () => {
    const handle = new EngineHandle({ timeSource: new DeterministicTimeSource() });
    const result = handle.loadScene(minimalScene);
    expect(result.valid).toBe(true);
  });

  it("falls back to default RealTimeSource", () => {
    const handle = new EngineHandle();
    const result = handle.loadScene(minimalScene);
    expect(result.valid).toBe(true);
  });

  it("keeps orchestrator API stable for mode switching", () => {
    vi.useFakeTimers();
    const handle = new EngineHandle({ timeSource: new DeterministicTimeSource() });
    handle.loadScene(minimalScene);
    handle.setNavigationMode("orbital", { targetBodyId: "sun-1" });

    const container = { nodeType: 1 } as unknown as HTMLElement;
    handle.start(container);
    vi.advanceTimersByTime(20);

    expect(handle.getNavigationState().mode).toBe("orbital");
    handle.stop();
    vi.useRealTimers();
  });

  it("rejects orbital mode transitions without valid target", () => {
    const handle = new EngineHandle({ timeSource: new DeterministicTimeSource() });
    handle.loadScene(minimalScene);

    expect(() => handle.setNavigationMode("orbital")).toThrow("targetBodyId");
    expect(() => handle.setNavigationMode("orbital", { targetBodyId: "unknown" })).toThrow("Unknown orbital target body");
  });
});
