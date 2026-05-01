import type { RenderInput } from "../core/models";
import type { Renderer as RendererPort } from "../core/engine/system-ports";

interface SpatialPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

interface SpatialLine {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
}

interface SpatialReferenceLayer {
  sceneId: string;
  stars: SpatialPoint[];
  grid: SpatialLine[];
}

interface AxisLine {
  axis: "x" | "y" | "z";
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
}

interface MarkerPoint {
  id: string;
  x: number;
  y: number;
  z: number;
}

interface DevelopmentHelperLayer {
  axes: AxisLine[];
  markers: MarkerPoint[];
}

interface DevelopmentHelperOptions {
  axes: boolean;
  markers: boolean;
}

const createSeed = (text: string): number => {
  let seed = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    seed ^= text.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
};

const createRng = (seed: number): (() => number) => {
  let value = seed || 1;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0x100000000;
  };
};

const createBackgroundStars = (sceneId: string, count = 128): SpatialPoint[] => {
  const random = createRng(createSeed(sceneId));
  const radius = 1200;
  const stars: SpatialPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const sinPhi = Math.sin(phi);
    stars.push({
      x: radius * sinPhi * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * sinPhi * Math.sin(theta),
      intensity: 0.5 + random() * 0.5,
    });
  }

  return stars;
};

const createGrid = (extent = 300, step = 30): SpatialLine[] => {
  const lines: SpatialLine[] = [];

  for (let offset = -extent; offset <= extent; offset += step) {
    lines.push({
      from: { x: -extent, y: 0, z: offset },
      to: { x: extent, y: 0, z: offset },
    });
    lines.push({
      from: { x: offset, y: 0, z: -extent },
      to: { x: offset, y: 0, z: extent },
    });
  }

  return lines;
};

const createAxes = (length = 80): AxisLine[] => {
  return [
    { axis: "x", from: { x: 0, y: 0, z: 0 }, to: { x: length, y: 0, z: 0 } },
    { axis: "y", from: { x: 0, y: 0, z: 0 }, to: { x: 0, y: length, z: 0 } },
    { axis: "z", from: { x: 0, y: 0, z: 0 }, to: { x: 0, y: 0, z: length } },
  ];
};

const createMarkers = (input: RenderInput): MarkerPoint[] => {
  return Object.entries(input.simulation.bodyPositions).map(([id, position]) => ({
    id,
    x: position.x,
    y: position.y,
    z: position.z,
  }));
};

export class Renderer implements RendererPort {
  private attached = false;

  private lastInput: RenderInput | null = null;

  private spatialReferences: SpatialReferenceLayer | null = null;

  private developmentHelpers: DevelopmentHelperLayer | null = null;

  private developmentHelpersEnabled = false;

  private developmentHelperOptions: DevelopmentHelperOptions = {
    axes: true,
    markers: true,
  };

  attach(_container: HTMLElement): void {
    this.attached = true;
  }

  detach(): void {
    this.attached = false;
    this.lastInput = null;
    this.spatialReferences = null;
    this.developmentHelpers = null;
  }

  render(input: RenderInput): void {
    if (!this.attached) {
      return;
    }

    if (!this.spatialReferences || this.spatialReferences.sceneId !== input.scene.sceneId) {
      this.spatialReferences = {
        sceneId: input.scene.sceneId,
        stars: createBackgroundStars(input.scene.sceneId),
        grid: createGrid(),
      };
    }

    if (this.developmentHelpersEnabled) {
      this.developmentHelpers = {
        axes: this.developmentHelperOptions.axes ? createAxes() : [],
        markers: this.developmentHelperOptions.markers ? createMarkers(input) : [],
      };
    } else {
      this.developmentHelpers = null;
    }

    this.lastInput = input;
  }

  getLastInput(): RenderInput | null {
    return this.lastInput;
  }

  getSpatialReferences(): SpatialReferenceLayer | null {
    return this.spatialReferences;
  }

  setDevelopmentHelpersEnabled(enabled: boolean): void {
    this.developmentHelpersEnabled = enabled;
    if (!enabled) {
      this.developmentHelpers = null;
    }
  }

  setDevelopmentHelperOptions(options: Partial<DevelopmentHelperOptions>): void {
    this.developmentHelperOptions = {
      ...this.developmentHelperOptions,
      ...options,
    };
  }

  getDevelopmentHelpers(): DevelopmentHelperLayer | null {
    return this.developmentHelpers;
  }
}
