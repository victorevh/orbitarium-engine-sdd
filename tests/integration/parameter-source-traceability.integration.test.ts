import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

const REFERENCES_PATH = "specs/004-solar-system-data/NASA-JPL-REFERENCES.md";

const REQUIRED_SOURCE_METADATA_FIELDS = ["epoch", "source", "referenceDate", "notes"] as const;

const BODY_SECTION_KEYWORDS: Record<string, string[]> = {
  sun: ["### Sun", "Sidereal rotation period: 25.38 days"],
  mercury: ["### Mercury", "Semi-major axis: 0.387099 AU"],
  venus: ["### Venus", "Semi-major axis: 0.723332 AU"],
  earth: ["### Earth", "Semi-major axis: 1.00000 AU"],
  moon: ["### Moon (Earth's Satellite)", "Semi-major axis: 0.00257 AU", "**Parent Body**: Earth"],
  mars: ["### Mars", "Semi-major axis: 1.523688 AU"],
  jupiter: ["### Jupiter", "Semi-major axis: 5.20260 AU"],
  saturn: ["### Saturn", "Semi-major axis: 9.53707 AU"],
  uranus: ["### Uranus", "Semi-major axis: 19.1913 AU"],
  neptune: ["### Neptune", "Semi-major axis: 30.0690 AU"],
};

describe("parameter source traceability", () => {
  it("includes required sourceMetadata fields in the complete scene", () => {
    const metadata = solarSystemComplete.sourceMetadata;
    expect(metadata).toBeDefined();

    for (const field of REQUIRED_SOURCE_METADATA_FIELDS) {
      const value = metadata?.[field];
      expect(typeof value).toBe("string");
      expect(value?.trim().length).toBeGreaterThan(0);
    }

    expect(metadata?.source).toContain("NASA/JPL");
  });

  it("contains a NASA/JPL reference section for every body in the dataset", () => {
    const referencesText = readFileSync(REFERENCES_PATH, "utf8");

    for (const body of solarSystemComplete.bodies) {
      const keywords = BODY_SECTION_KEYWORDS[body.bodyId];
      expect(keywords, `Missing keyword map for ${body.bodyId}`).toBeDefined();

      for (const keyword of keywords ?? []) {
        expect(referencesText).toContain(keyword);
      }
    }
  });

  it("documents epoch and source consistency between scene metadata and reference file", () => {
    const referencesText = readFileSync(REFERENCES_PATH, "utf8");

    expect(referencesText).toContain(`**Epoch**: ${solarSystemComplete.sourceMetadata?.epoch}`);
    expect(referencesText).toContain(`**Reference Date**: ${solarSystemComplete.sourceMetadata?.referenceDate}`);
    expect(referencesText).toContain(`**Source**: ${solarSystemComplete.sourceMetadata?.source}`);
  });
});
