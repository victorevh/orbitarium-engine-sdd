import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];
if (!target) {
  console.error("Usage: npm run validate:scene -- <path-to-scene.json>");
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), target);
if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

const raw = fs.readFileSync(absolutePath, "utf8");
const parsed = JSON.parse(raw);

if (parsed.coordinateSystem !== "right-handed") {
  console.error("Invalid scene: coordinateSystem must be right-handed");
  process.exit(1);
}

if (!Array.isArray(parsed.bodies) || parsed.bodies.length === 0) {
  console.error("Invalid scene: at least one body is required");
  process.exit(1);
}

if (!Array.isArray(parsed.lights) || parsed.lights.length === 0) {
  console.error("Invalid scene: at least one light is required");
  process.exit(1);
}

console.log("Scene validation passed");
