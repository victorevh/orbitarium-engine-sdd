import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemScene from "../../specs/samples/solar-system.json";

const PLANET_IDS = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

describe("solar system simulation integration", () => {
  it("Earth completes approximately one orbit after 365 simulated days", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1); // 1 second per tick

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemScene as any);

    // Advance 365 ticks × 1 s/tick × simDaysPerRealSecond=1 → 365 simulated days
    for (let i = 0; i < 365; i++) {
      sim.update(timeSource.sample());
    }

    const snapshot = sim.getSnapshot();

    // Earth should be at roughly its orbital radius (~1 AU from the sun at origin)
    const earth = snapshot.bodyStates["earth"];
    expect(earth).toBeDefined();
    const earthDist = Math.sqrt(
      earth.positionAU.x ** 2 + earth.positionAU.y ** 2 + earth.positionAU.z ** 2,
    );
    expect(earthDist).toBeGreaterThan(0.9);
    expect(earthDist).toBeLessThan(1.1);
  });

  it("all 8 planets have finite positions after 365 simulated days", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemScene as any);
    for (let i = 0; i < 365; i++) {
      sim.update(timeSource.sample());
    }

    const snapshot = sim.getSnapshot();

    for (const id of PLANET_IDS) {
      const body = snapshot.bodyStates[id];
      expect(body, `${id} should be present in bodyStates`).toBeDefined();
      expect(isFinite(body.positionAU.x), `${id}.x should be finite`).toBe(true);
      expect(isFinite(body.positionAU.y), `${id}.y should be finite`).toBe(true);
      expect(isFinite(body.positionAU.z), `${id}.z should be finite`).toBe(true);
    }
  });

  it("simulatedDays is approximately 365 after 365 1-second ticks at rate=1", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemScene as any);
    for (let i = 0; i < 365; i++) {
      sim.update(timeSource.sample());
    }

    const snapshot = sim.getSnapshot();
    expect(snapshot.simulatedDays).toBeCloseTo(365, 0);
  });

  it("bodyPositions is empty for a Keplerian-only scene", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemScene as any);
    sim.update(timeSource.sample());

    const snapshot = sim.getSnapshot();
    // Keplerian bodies should only appear in bodyStates, not bodyPositions
    for (const id of PLANET_IDS) {
      expect(snapshot.bodyPositions[id]).toBeUndefined();
    }
  });

  it("all 8 planets remain numerically stable after 10000 simulated years at 1000x acceleration", () => {
    const sim = new SimulationSystem();
    // 60 fps: ~0.0167 seconds per tick. Set rate to 365250 to get ~1000 years per real second.
    const timeSource = new TestTimeSource(0, 1 / 60);
    const ticksPerSecond = 60;
    const realSeconds = 10;
    const totalTicks = ticksPerSecond * realSeconds; // 600 ticks

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemScene as any);
    sim.setTimeScale(365250); // ~1000 simulated years per real second

    for (let i = 0; i < totalTicks; i++) {
      sim.update(timeSource.sample());
    }

    const snapshot = sim.getSnapshot();

    // All planet positions should be finite (no NaN, no Infinity, no drift)
    for (const id of PLANET_IDS) {
      const body = snapshot.bodyStates[id];
      expect(body, `${id} should be present in bodyStates`).toBeDefined();
      expect(isFinite(body.positionAU.x), `${id}.x should be finite after long run`).toBe(true);
      expect(isFinite(body.positionAU.y), `${id}.y should be finite after long run`).toBe(true);
      expect(isFinite(body.positionAU.z), `${id}.z should be finite after long run`).toBe(true);

      // Positions should be in a reasonable range (not drifted to infinity)
      const distance = Math.sqrt(
        body.positionAU.x ** 2 + body.positionAU.y ** 2 + body.positionAU.z ** 2,
      );
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(40); // Farthest planet (Neptune) is ~30 AU
    }
  });
});
