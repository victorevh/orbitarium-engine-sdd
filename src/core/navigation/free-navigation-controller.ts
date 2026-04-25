import type { NavigationState } from "../models";
import type { TimeContext } from "../time/time-source";

export class FreeNavigationController {
  update(state: NavigationState, time: TimeContext): NavigationState {
    return {
      ...state,
      // Movement input integration is intentionally minimal in MVP.
      lastUpdateTick: time.tick,
    };
  }
}
