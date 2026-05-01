import type { Vector3 } from "../types";

export interface ScaleTransform {
  auToRender(p: Vector3): Vector3;
  renderToAU(p: Vector3): Vector3;
}

export function createScaleTransform(renderUnitsPerAU: number): ScaleTransform {
  return {
    auToRender: (p) => ({
      x: p.x * renderUnitsPerAU,
      y: p.y * renderUnitsPerAU,
      z: p.z * renderUnitsPerAU,
    }),
    renderToAU: (p) => ({
      x: p.x / renderUnitsPerAU,
      y: p.y / renderUnitsPerAU,
      z: p.z / renderUnitsPerAU,
    }),
  };
}
