import * as THREE from "three";
import type { CelestialBodyDefinition, RenderInput } from "../../src/index";

interface StarLayer {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

interface OrientationFeedback {
  mode: "free" | "orbital";
  position: { x: number; y: number; z: number };
  forward: { x: number; y: number; z: number };
  orbitalTargetBodyId?: string;
}

const typeColor: Record<CelestialBodyDefinition["type"], number> = {
  star: 0xffe484,
  planet: 0x8ecaff,
  moon: 0xd8d8d8,
};

const scaleSize = (size: number): number => {
  return Math.max(0.5, Math.sqrt(size) * 0.1);
};

const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

const randomRadiusInVolume = (minRadius: number, maxRadius: number): number => {
  const minCubed = minRadius * minRadius * minRadius;
  const maxCubed = maxRadius * maxRadius * maxRadius;
  return Math.cbrt(randomRange(minCubed, maxCubed));
};

const createSpaceGradientTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create canvas context for demo background");
  }

  const gradient = context.createRadialGradient(300, 260, 80, 540, 540, 860);
  gradient.addColorStop(0, "#152747");
  gradient.addColorStop(0.35, "#0b1730");
  gradient.addColorStop(0.7, "#050d1c");
  gradient.addColorStop(1, "#02060f");

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createStarLayer = (count: number, minRadius: number, maxRadius: number, size: number, opacity: number): StarLayer => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const theta = randomRange(0, Math.PI * 2);
    const u = randomRange(-1, 1);
    const horizontal = Math.sqrt(1 - u * u);
    const radius = randomRadiusInVolume(minRadius, maxRadius);

    const x = radius * horizontal * Math.cos(theta);
    const y = radius * u;
    const z = radius * horizontal * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const brightness = randomRange(0.35, 1);
    const hue = randomRange(0.54, 0.66);
    const saturation = randomRange(0.2, 0.45);
    color.setHSL(hue, saturation, brightness);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.renderOrder = -10;

  return {
    points,
    geometry,
    material,
  };
};

export class ThreeDemoRenderer {
  private scene = new THREE.Scene();

  private camera = new THREE.PerspectiveCamera(60, 1, 0.1, 5000);

  private renderer: THREE.WebGLRenderer | null = null;

  private container: HTMLElement | null = null;

  private bodyMeshes = new Map<string, THREE.Mesh>();

  private resizeHandler: (() => void) | null = null;

  private orientationFeedback: OrientationFeedback | null = null;

  private starLayers: StarLayer[] = [];

  private backgroundTexture: THREE.CanvasTexture | null = null;

  attach(container: HTMLElement): void {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.backgroundTexture = createSpaceGradientTexture();
    this.scene.background = this.backgroundTexture;

    const ambient = new THREE.AmbientLight(0x9fb6ff, 0.35);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(40, 60, 20);
    this.scene.add(ambient, key);

    // Reference stars are visual-only and independent from simulation state.
    this.starLayers = [
      createStarLayer(2400, 700, 1200, 1.1, 0.8),
      createStarLayer(1600, 1200, 2200, 1.8, 0.72),
      createStarLayer(900, 2200, 3600, 2.5, 0.65),
    ];

    for (const layer of this.starLayers) {
      this.scene.add(layer.points);
    }

    this.camera.position.set(0, 30, 120);
    this.camera.lookAt(0, 0, 0);

    container.replaceChildren(this.renderer.domElement);

    const onResize = () => {
      if (!this.renderer || !this.container) {
        return;
      }

      const width = this.container.clientWidth || 1;
      const height = this.container.clientHeight || 1;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    };

    this.resizeHandler = onResize;
    window.addEventListener("resize", onResize);
    onResize();
  }

  detach(): void {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }

    this.bodyMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => mat.dispose());
      } else {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    this.bodyMeshes.clear();

    for (const layer of this.starLayers) {
      this.scene.remove(layer.points);
      layer.geometry.dispose();
      layer.material.dispose();
    }
    this.starLayers = [];

    if (this.backgroundTexture) {
      this.backgroundTexture.dispose();
      this.backgroundTexture = null;
      this.scene.background = null;
    }

    this.renderer?.dispose();
    this.renderer = null;
    this.container = null;
    this.orientationFeedback = null;
  }

  render(input: RenderInput): void {
    if (!this.renderer) {
      return;
    }

    for (const body of input.scene.bodies) {
      if (!this.bodyMeshes.has(body.bodyId)) {
        const geometry = new THREE.SphereGeometry(scaleSize(body.size), 24, 24);
        const material = new THREE.MeshStandardMaterial({ color: typeColor[body.type] });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.bodyMeshes.set(body.bodyId, mesh);
      }

      const mesh = this.bodyMeshes.get(body.bodyId);
      const position = input.simulation.bodyPositions[body.bodyId] ?? body.initialPosition;
      mesh?.position.set(position.x, position.y, position.z);
    }

    const navigation = input.navigation;
    this.camera.position.set(navigation.position.x, navigation.position.y, navigation.position.z);

    if (navigation.mode === "free") {
      this.camera.quaternion.set(
        navigation.orientation.x,
        navigation.orientation.y,
        navigation.orientation.z,
        navigation.orientation.w,
      );
    } else {
      const targetBody = navigation.orbitalTargetBodyId
        ? input.simulation.bodyPositions[navigation.orbitalTargetBodyId] ??
          input.scene.bodies.find((body) => body.bodyId === navigation.orbitalTargetBodyId)?.initialPosition
        : undefined;

      const target = targetBody ?? { x: 0, y: 0, z: 0 };
      this.camera.lookAt(target.x, target.y, target.z);
    }

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    this.orientationFeedback = {
      mode: input.navigation.mode,
      position: {
        x: input.navigation.position.x,
        y: input.navigation.position.y,
        z: input.navigation.position.z,
      },
      forward: {
        x: forward.x,
        y: forward.y,
        z: forward.z,
      },
      orbitalTargetBodyId: input.navigation.orbitalTargetBodyId,
    };

    this.renderer.render(this.scene, this.camera);
  }

  getOrientationFeedback(): OrientationFeedback | null {
    return this.orientationFeedback;
  }
}
