import { EngineHandle, NavigationController, type SceneConfiguration } from "../../src/index";
import { ThreeDemoRenderer } from "./three-demo-renderer";
import { createScaleTransform } from "../../src/core/simulation/scale-mapping";
import solarSystemScene from "../../specs/samples/solar-system-complete.json";
import noMoonScene from "../../specs/samples/solar-system-no-moon.json";
import customBodyScene from "../../specs/samples/solar-system-custom-body.json";

const status = document.getElementById("status");
const viewer = document.getElementById("viewer");
const freeButton = document.getElementById("free-btn");
const orbitalButton = document.getElementById("orbital-btn");

if (!status || !viewer || !freeButton || !orbitalButton) {
  throw new Error("Demo DOM is missing required elements.");
}

const scenes: Record<string, SceneConfiguration> = {
  complete: solarSystemScene as any,
  "no-moon": noMoonScene as any,
  custom: customBodyScene as any,
};

const sceneName = new URL(window.location.href).searchParams.get("scene") ?? "complete";
const sceneToLoad: SceneConfiguration = scenes[sceneName] ?? scenes.complete;
const scaleTransform = createScaleTransform(sceneToLoad.scaleProfile.renderUnitsPerAU ?? 100);
const demoRenderer = new ThreeDemoRenderer(scaleTransform, sceneToLoad.scaleProfile);
const navigationController = new NavigationController();
const engine = new EngineHandle({ renderer: demoRenderer, navigationController });

let validation = engine.loadScene(sceneToLoad);

if (!validation.valid) {
  status.textContent = `Scene validation failed: ${validation.errors.map((e) => e.message).join(" | ")}`;
  throw new Error(status.textContent);
}

let currentScene = sceneToLoad;
let currentTimeScale = sceneToLoad.timeScale?.simDaysPerRealSecond ?? 1;
status.textContent = `Loaded scene: ${currentScene.sceneId}`;

engine.start(viewer as HTMLElement);

const getDirectionHint = (x: number, y: number, z: number): string => {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);

  if (absX >= absY && absX >= absZ) {
    return x >= 0 ? "+X" : "-X";
  }

  if (absY >= absX && absY >= absZ) {
    return y >= 0 ? "+Y" : "-Y";
  }

  return z >= 0 ? "+Z" : "-Z";
};

// J2000.0 epoch: 2000-Jan-01 12:00 UTC — the reference for all orbital elements.
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

const formatSimDate = (simulatedDays: number): string => {
  const ms = J2000_MS + simulatedDays * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
};

const updateStatus = (): void => {
  const feedback = demoRenderer.getOrientationFeedback();
  if (!feedback) {
    return;
  }

  const simulatedDays = engine.getSimulatedDays();
  const simDate = formatSimDate(simulatedDays);
  const earthOrbits = Math.floor(simulatedDays / 365.25);
  const moonOrbits = Math.floor(simulatedDays / 27.3216);

  const modeLabel = feedback.mode === "orbital" ? `Orbital (${feedback.orbitalTargetBodyId ?? "no target"})` : "Free";
  const directionHint = getDirectionHint(feedback.forward.x, feedback.forward.y, feedback.forward.z);
  const timeScaleStr = currentTimeScale.toFixed(3);

  status.textContent = [
    `Date: ${simDate}`,
    `Earth: ${earthOrbits} orb`,
    `Moon: ${moonOrbits} orb`,
    `Speed: ${timeScaleStr} d/s`,
    `Mode: ${modeLabel}`,
    `Fwd: ${directionHint}`,
  ].join(" | ");
};

const tickStatus = (): void => {
  updateStatus();
  requestAnimationFrame(tickStatus);
};

tickStatus();

const freeKeys = new Set(["w", "a", "s", "d", "q", "e"]);
let isPointerActive = false;

const isFreeMode = (): boolean => engine.getNavigationState().mode === "free";

const clearFreeInputs = (): void => {
  for (const key of freeKeys) {
    navigationController.setFreeControlKeyState(key, false);
  }
};

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  // Time scale controls
  if (key === "=" || key === "+") {
    event.preventDefault();
    const newRate = Math.min(currentTimeScale * 2, 365250);
    engine.setTimeScale(newRate);
    currentTimeScale = newRate;
    return;
  }

  if (key === "-" || key === "_") {
    event.preventDefault();
    const newRate = Math.max(currentTimeScale / 2, 0.001);
    engine.setTimeScale(newRate);
    currentTimeScale = newRate;
    return;
  }

  if (key === "0") {
    event.preventDefault();
    engine.setTimeScale(1.0);
    currentTimeScale = 1.0;
    return;
  }

  // Free navigation controls
  if (!freeKeys.has(key)) {
    return;
  }

  if (!isFreeMode()) {
    return;
  }

  event.preventDefault();
  navigationController.setFreeControlKeyState(key, true);
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (!freeKeys.has(key)) {
    return;
  }

  if (!isFreeMode()) {
    return;
  }

  event.preventDefault();
  navigationController.setFreeControlKeyState(key, false);
});

viewer.addEventListener("mousedown", (event) => {
  if (!isFreeMode()) {
    return;
  }

  if (event.button !== 0) {
    return;
  }

  isPointerActive = true;
});

window.addEventListener("mouseup", () => {
  isPointerActive = false;
});

window.addEventListener("mousemove", (event) => {
  if (!isPointerActive || !isFreeMode()) {
    return;
  }

  navigationController.applyFreeLookDelta(event.movementX, event.movementY);
});

window.addEventListener("blur", () => {
  isPointerActive = false;
  clearFreeInputs();
});

freeButton.addEventListener("click", () => {
  engine.setNavigationMode("free");
  updateStatus();
});

orbitalButton.addEventListener("click", () => {
  engine.setNavigationMode("orbital", { targetBodyId: "sun" });
  clearFreeInputs();
  updateStatus();
});

window.addEventListener("beforeunload", () => {
  engine.stop();
});
