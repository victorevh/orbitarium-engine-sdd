import { describe, expect, it } from "vitest";
import { createScaleTransform } from "../../src/core/simulation/scale-mapping";

describe("createScaleTransform", () => {
  it("returns object with auToRender and renderToAU methods", () => {
    const st = createScaleTransform(100);
    expect(typeof st.auToRender).toBe("function");
    expect(typeof st.renderToAU).toBe("function");
  });

  it("auToRender scales each component by renderUnitsPerAU=100", () => {
    const st = createScaleTransform(100);
    expect(st.auToRender({ x: 1, y: 0, z: 0 })).toEqual({ x: 100, y: 0, z: 0 });
    expect(st.auToRender({ x: 0, y: 2, z: 0 })).toEqual({ x: 0, y: 200, z: 0 });
    expect(st.auToRender({ x: 0, y: 0, z: 3 })).toEqual({ x: 0, y: 0, z: 300 });
  });

  it("renderToAU divides each component by renderUnitsPerAU=100", () => {
    const st = createScaleTransform(100);
    expect(st.renderToAU({ x: 100, y: 0, z: 0 })).toEqual({ x: 1, y: 0, z: 0 });
    expect(st.renderToAU({ x: 0, y: 200, z: 0 })).toEqual({ x: 0, y: 2, z: 0 });
    expect(st.renderToAU({ x: 0, y: 0, z: 300 })).toEqual({ x: 0, y: 0, z: 3 });
  });

  it("auToRender→renderToAU round-trip is identity", () => {
    const st = createScaleTransform(100);
    const original = { x: 1.5, y: -0.7, z: 3.2 };
    const result = st.renderToAU(st.auToRender(original));
    expect(result.x).toBeCloseTo(original.x, 10);
    expect(result.y).toBeCloseTo(original.y, 10);
    expect(result.z).toBeCloseTo(original.z, 10);
  });

  it("scales by 50 when renderUnitsPerAU=50", () => {
    const st = createScaleTransform(50);
    expect(st.auToRender({ x: 1, y: 0, z: 0 })).toEqual({ x: 50, y: 0, z: 0 });
    expect(st.auToRender({ x: 2, y: 3, z: 4 })).toEqual({ x: 100, y: 150, z: 200 });
  });

  it("renderToAU→auToRender round-trip is identity", () => {
    const st = createScaleTransform(50);
    const original = { x: 100, y: 50, z: 25 };
    const result = st.auToRender(st.renderToAU(original));
    expect(result.x).toBeCloseTo(original.x, 10);
    expect(result.y).toBeCloseTo(original.y, 10);
    expect(result.z).toBeCloseTo(original.z, 10);
  });
});
