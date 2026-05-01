import { describe, expect, it } from "vitest";
import { NavigationController } from "../../src/core/navigation/navigation-controller";
import { TestTimeSource } from "../helpers/test-time-source";

describe("navigation controller", () => {
  it("updates deterministic ticks in free mode", () => {
    const controller = new NavigationController();
    const time = new TestTimeSource(0, 1 / 60);

    controller.update(time.sample());
    controller.update(time.sample());

    expect(controller.getState().mode).toBe("free");
    expect(controller.getState().lastUpdateTick).toBe(2);
  });

  it("switches to orbital mode with target", () => {
    const controller = new NavigationController();
    const time = new TestTimeSource(0, 1 / 60);

    controller.setMode("orbital", { targetBodyId: "sun-1" });
    controller.update(time.sample());

    expect(controller.getState().mode).toBe("orbital");
    expect(controller.getState().orbitalTargetBodyId).toBe("sun-1");
  });
});
