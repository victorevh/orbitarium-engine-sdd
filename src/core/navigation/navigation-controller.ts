import type { NavigationMode, NavigationState } from "../models";
import type { NavigationController as NavigationControllerPort } from "../engine/system-ports";
import type { TimeContext } from "../time/time-source";
import { createInitialNavigationState } from "../camera/camera-state";
import { FreeNavigationController } from "./free-navigation-controller";
import { OrbitalNavigationController } from "./orbital-navigation-controller";

export class NavigationController implements NavigationControllerPort {
  private readonly freeController = new FreeNavigationController();

  private readonly orbitalController = new OrbitalNavigationController();

  private state: NavigationState = createInitialNavigationState();

  setFreeControlKeyState(key: string, pressed: boolean): void {
    if (this.state.mode !== "free") {
      return;
    }

    this.freeController.setKeyState(key, pressed);
  }

  applyFreeLookDelta(deltaX: number, deltaY: number): void {
    if (this.state.mode !== "free") {
      return;
    }

    this.freeController.applyMouseDelta(deltaX, deltaY);
  }

  update(time: TimeContext): void {
    this.state =
      this.state.mode === "orbital"
        ? this.orbitalController.update(this.state, time)
        : this.freeController.update(this.state, time);
  }

  setMode(mode: NavigationMode, options?: { targetBodyId?: string }): void {
    this.state = {
      ...this.state,
      mode,
      orbitalTargetBodyId: mode === "orbital" ? options?.targetBodyId : undefined,
    };
  }

  getState(): NavigationState {
    return this.state;
  }

  setInertia(enabled: boolean): void {
    this.state = {
      ...this.state,
      inertiaEnabled: enabled,
    };
  }
}
