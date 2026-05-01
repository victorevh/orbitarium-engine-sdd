import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SIMULATION_FILES = [
  "src/core/simulation/simulation-system.ts",
  "src/core/simulation/orbit-solver.ts",
  "src/core/simulation/orbital-elements.ts",
  "src/core/simulation/rotation-solver.ts",
  "src/core/simulation/time-scale.ts",
];

describe("simulation layer isolation", () => {
  it("does not depend on renderer scale mapping or wall-clock APIs", () => {
    for (const filePath of SIMULATION_FILES) {
      const source = readFileSync(filePath, "utf8");

      expect(source).not.toContain("scale-mapping");
      expect(source).not.toContain("ScaleTransform");
      expect(source).not.toContain("Date.now");
      expect(source).not.toContain("performance.now");
    }
  });
});