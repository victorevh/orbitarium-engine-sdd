import type { NavigationState } from "../models";
import type { TimeContext } from "../time/time-source";

const TAU = Math.PI * 2;

export class OrbitalNavigationController {
  update(state: NavigationState, time: TimeContext): NavigationState {
    const angle = (time.nowSeconds * 0.1) % TAU;
    const radius = 10;

    return {
      ...state,
      position: {
        x: Math.cos(angle) * radius,
        y: state.position.y,
        z: Math.sin(angle) * radius,
      },
      lastUpdateTick: time.tick,
    };
  }
}
