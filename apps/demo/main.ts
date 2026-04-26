import { EngineHandle, NavigationController, type SceneConfiguration } from "../../src/index";
import { ThreeDemoRenderer } from "./three-demo-renderer";

const status = document.getElementById("status");
const viewer = document.getElementById("viewer");
const freeButton = document.getElementById("free-btn");
const orbitalButton = document.getElementById("orbital-btn");

if (!status || !viewer || !freeButton || !orbitalButton) {
  throw new Error("Demo DOM is missing required elements.");
}

const scene: SceneConfiguration = {
  sceneId: "demo-scene",
  name: "Minimal Demo System",
  coordinateSystem: "right-handed",
  scaleProfile: {
    minZoom: 0.001,
    maxZoom: 10000,
  },
  bodies: [
    {
      bodyId: "sun-1",
      type: "star",
      size: 350,
      initialPosition: { x: 0, y: 0, z: 0 },
      rotation: { angularSpeed: 0.01, axis: { x: 0, y: 1, z: 0 } },
      orbit: {
        model: "circular",
        centerBodyId: "sun-1",
        radius: 0,
        angularSpeed: 0,
      },
    },
    {
      bodyId: "planet-1",
      type: "planet",
      size: 48,
      initialPosition: { x: 120, y: 0, z: 0 },
      rotation: { angularSpeed: 0.02, axis: { x: 0, y: 1, z: 0 } },
      orbit: {
        model: "circular",
        centerBodyId: "sun-1",
        radius: 120,
        angularSpeed: 0.35,
      },
    },
    {
      bodyId: "moon-1",
      type: "moon",
      size: 16,
      initialPosition: { x: 160, y: 0, z: 0 },
      rotation: { angularSpeed: 0.03, axis: { x: 0, y: 1, z: 0 } },
      orbit: {
        model: "elliptical",
        centerBodyId: "planet-1",
        semiMajorAxis: 40,
        semiMinorAxis: 26,
        angularSpeed: 1.1,
      },
    },
  ],
  lights: [
    {
      lightId: "sun-light",
      sourceBodyId: "sun-1",
      intensity: 1,
      range: 5000,
    },
  ],
};

const demoRenderer = new ThreeDemoRenderer();
const navigationController = new NavigationController();
const engine = new EngineHandle({ renderer: demoRenderer, navigationController });
const validation = engine.loadScene(scene);

if (!validation.valid) {
  status.textContent = `Scene validation failed: ${validation.errors.map((e) => e.message).join(" | ")}`;
  throw new Error(status.textContent);
}

engine.start(viewer as HTMLElement);

const format = (value: number): string => value.toFixed(2);

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

const updateStatus = (): void => {
  const feedback = demoRenderer.getOrientationFeedback();
  if (!feedback) {
    return;
  }

  const modeLabel = feedback.mode === "orbital" ? `Orbital (${feedback.orbitalTargetBodyId ?? "no target"})` : "Free";
  const directionHint = getDirectionHint(feedback.forward.x, feedback.forward.y, feedback.forward.z);

  status.textContent = `Mode: ${modeLabel} | Pos: (${format(feedback.position.x)}, ${format(feedback.position.y)}, ${format(
    feedback.position.z,
  )}) | Forward: (${format(feedback.forward.x)}, ${format(feedback.forward.y)}, ${format(
    feedback.forward.z,
  )}) ${directionHint}`;
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
  engine.setNavigationMode("orbital", { targetBodyId: "planet-1" });
  clearFreeInputs();
  updateStatus();
});

window.addEventListener("beforeunload", () => {
  engine.stop();
});
