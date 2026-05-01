import { describe, expect, it } from "vitest";
import { NavigationController } from "../../src/core/navigation/navigation-controller";
import { TestTimeSource } from "../helpers/test-time-source";

describe("navigation orientation integration", () => {
  it("moves forward along camera-forward direction in free mode", () => {
    const controller = new NavigationController();
    const time = new TestTimeSource(0, 1 / 60);

    controller.setFreeControlKeyState("w", true);
    controller.update(time.sample());

    const state = controller.getState();
    expect(state.mode).toBe("free");
    expect(state.position.z).toBeLessThan(-0.45);
    expect(Math.abs(state.position.x)).toBeLessThan(0.05);
  });

  it("keeps movement camera-relative after yaw rotation", () => {
    const controller = new NavigationController();
    const time = new TestTimeSource(0, 1 / 60);

    controller.applyFreeLookDelta(628, 0);
    controller.setFreeControlKeyState("w", true);
    controller.update(time.sample());

    const state = controller.getState();
    expect(state.mode).toBe("free");
    expect(state.position.x).toBeGreaterThan(0.35);
    expect(Math.abs(state.position.z)).toBeLessThan(0.2);
  });
});
