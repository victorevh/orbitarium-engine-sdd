import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string): string => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  return fs.readFileSync(absolutePath, "utf8");
};

describe("time source architecture boundaries", () => {
  it("prevents direct Date.now or performance.now in navigation and simulation systems", () => {
    const files = [
      "src/core/navigation/free-navigation-controller.ts",
      "src/core/navigation/orbital-navigation-controller.ts",
      "src/core/navigation/navigation-controller.ts",
      "src/core/simulation/orbit-solver.ts",
      "src/core/simulation/simulation-system.ts",
    ];

    for (const file of files) {
      const content = read(file);
      expect(content.includes("Date.now")).toBe(false);
      expect(content.includes("performance.now")).toBe(false);
    }
  });
});
