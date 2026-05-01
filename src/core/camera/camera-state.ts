import type { NavigationState } from "../models";

export const createInitialNavigationState = (): NavigationState => ({
  mode: "free",
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: 0, w: 1 },
  inertiaEnabled: true,
  lastUpdateTick: 0,
});
