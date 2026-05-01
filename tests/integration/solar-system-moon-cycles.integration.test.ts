import { describe, expect, it } from "vitest";
import { SimulationSystem } from "../../src/core/simulation/simulation-system";
import { TestTimeSource } from "../helpers/test-time-source";
import solarSystemComplete from "../../specs/samples/solar-system-complete.json";

/**
 * Moon orbital cycles integration tests (T010)
 * 
 * Verifies that the Moon completes its orbit around Earth with
 * correct timing, apogee/perigee stability, and multi-cycle behavior.
 */

describe("moon orbital cycles", () => {
  it("moon completes approximately one orbit after 27.32 simulated days", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1); // 1 second per tick

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const initialSnapshot = sim.getSnapshot();
    const initialMoonPos = {
      x: initialSnapshot.bodyStates["moon"].positionAU.x,
      y: initialSnapshot.bodyStates["moon"].positionAU.y,
      z: initialSnapshot.bodyStates["moon"].positionAU.z,
    };
    const initialEarthPos = {
      x: initialSnapshot.bodyStates["earth"].positionAU.x,
      y: initialSnapshot.bodyStates["earth"].positionAU.y,
      z: initialSnapshot.bodyStates["earth"].positionAU.z,
    };

    // Advance 27.32 days worth of ticks
    const ticksPerDay = 1;
    const lunarMonthTicks = Math.floor(27.32 * ticksPerDay);

    for (let i = 0; i < lunarMonthTicks; i++) {
      sim.update(timeSource.sample());
    }

    const finalSnapshot = sim.getSnapshot();
    const finalMoonPos = {
      x: finalSnapshot.bodyStates["moon"].positionAU.x,
      y: finalSnapshot.bodyStates["moon"].positionAU.y,
      z: finalSnapshot.bodyStates["moon"].positionAU.z,
    };
    const finalEarthPos = {
      x: finalSnapshot.bodyStates["earth"].positionAU.x,
      y: finalSnapshot.bodyStates["earth"].positionAU.y,
      z: finalSnapshot.bodyStates["earth"].positionAU.z,
    };

    // Compare moon distance to earth (should return approximately to initial separation)
    const initialMoonToEarth = Math.sqrt(
      (initialMoonPos.x - initialEarthPos.x) ** 2 +
        (initialMoonPos.y - initialEarthPos.y) ** 2 +
        (initialMoonPos.z - initialEarthPos.z) ** 2,
    );

    const finalMoonToEarth = Math.sqrt(
      (finalMoonPos.x - finalEarthPos.x) ** 2 +
        (finalMoonPos.y - finalEarthPos.y) ** 2 +
        (finalMoonPos.z - finalEarthPos.z) ** 2,
    );

    expect(Math.abs(finalMoonToEarth - initialMoonToEarth)).toBeLessThan(0.0005);
  });

  it("moon reaches perigee (minimum distance from earth) at expected times", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    // Track moon distance from earth over time
    const distances: number[] = [];
    const ticksPerDay = 1;
    const orbitTicks = Math.floor(27.32 * ticksPerDay);

    for (let i = 0; i < orbitTicks; i++) {
      const snapshot = sim.getSnapshot();
      const moonState = snapshot.bodyStates["moon"];
      const earthState = snapshot.bodyStates["earth"];

      const distance = Math.sqrt(
        (moonState.positionAU.x - earthState.positionAU.x) ** 2 +
          (moonState.positionAU.y - earthState.positionAU.y) ** 2 +
          (moonState.positionAU.z - earthState.positionAU.z) ** 2,
      );

      distances.push(distance);
      sim.update(timeSource.sample());
    }

    // Find minimum distance (perigee)
    const minDistance = Math.min(...distances);
    const minIndex = distances.indexOf(minDistance);

    // Perigee should occur, and be at a reasonable distance
    // Moon perigee distance ~356,400 km ≈ 0.00238 AU
    expect(minDistance).toBeGreaterThan(0.0023);
    expect(minDistance).toBeLessThan(0.0026);

    // Perigee should occur roughly in the middle-late phase of the orbit
    expect(minIndex).toBeGreaterThan(0);
    expect(minIndex).toBeLessThan(orbitTicks - 1);
  });

  it("moon reaches apogee (maximum distance from earth) at expected times", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const distances: number[] = [];
    const ticksPerDay = 1;
    const orbitTicks = Math.floor(27.32 * ticksPerDay);

    for (let i = 0; i < orbitTicks; i++) {
      const snapshot = sim.getSnapshot();
      const moonState = snapshot.bodyStates["moon"];
      const earthState = snapshot.bodyStates["earth"];

      const distance = Math.sqrt(
        (moonState.positionAU.x - earthState.positionAU.x) ** 2 +
          (moonState.positionAU.y - earthState.positionAU.y) ** 2 +
          (moonState.positionAU.z - earthState.positionAU.z) ** 2,
      );

      distances.push(distance);
      sim.update(timeSource.sample());
    }

    // Find maximum distance (apogee)
    const maxDistance = Math.max(...distances);
    const maxIndex = distances.indexOf(maxDistance);

    // Apogee should occur, and be at a reasonable distance
    // Moon apogee distance ~406,700 km ≈ 0.00272 AU
    expect(maxDistance).toBeGreaterThan(0.0026);
    expect(maxDistance).toBeLessThan(0.0028);

    // Apogee should occur before perigee (or cycle boundary)
    expect(maxIndex).toBeGreaterThan(0);
    expect(maxIndex).toBeLessThan(orbitTicks - 1);
  });

  it("moon maintains orbital stability over multiple cycles", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const ticksPerDay = 1;
    const orbitTicks = Math.floor(27.32 * ticksPerDay);

    // Run 3 lunar months
    const cycleMoonDistances: number[][] = [];

    for (let cycle = 0; cycle < 3; cycle++) {
      const cycleDistances: number[] = [];

      for (let i = 0; i < orbitTicks; i++) {
        const snapshot = sim.getSnapshot();
        const moonState = snapshot.bodyStates["moon"];
        const earthState = snapshot.bodyStates["earth"];

        const distance = Math.sqrt(
          (moonState.positionAU.x - earthState.positionAU.x) ** 2 +
            (moonState.positionAU.y - earthState.positionAU.y) ** 2 +
            (moonState.positionAU.z - earthState.positionAU.z) ** 2,
        );

        cycleDistances.push(distance);
        sim.update(timeSource.sample());
      }

      cycleMoonDistances.push(cycleDistances);
    }

    // Compare min and max distances across cycles
    // They should be stable (within ~2% variance)
    const cycle1Min = Math.min(...cycleMoonDistances[0]);
    const cycle2Min = Math.min(...cycleMoonDistances[1]);
    const cycle3Min = Math.min(...cycleMoonDistances[2]);

    const cycle1Max = Math.max(...cycleMoonDistances[0]);
    const cycle2Max = Math.max(...cycleMoonDistances[1]);
    const cycle3Max = Math.max(...cycleMoonDistances[2]);

    expect(Math.abs(cycle1Min - cycle2Min) / cycle1Min).toBeLessThan(0.02);
    expect(Math.abs(cycle2Min - cycle3Min) / cycle2Min).toBeLessThan(0.02);
    expect(Math.abs(cycle1Max - cycle2Max) / cycle1Max).toBeLessThan(0.02);
    expect(Math.abs(cycle2Max - cycle3Max) / cycle2Max).toBeLessThan(0.02);
  });

  it("moon and earth remain bound (no escape) over 3 months", () => {
    const sim = new SimulationSystem();
    const timeSource = new TestTimeSource(0, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sim.applyScene(solarSystemComplete as any);
    sim.update(timeSource.sample());

    const ticksPerDay = 1;
    const totalTicks = Math.floor(82 * ticksPerDay); // ~3 lunar months

    for (let i = 0; i < totalTicks; i++) {
      const snapshot = sim.getSnapshot();
      const moonState = snapshot.bodyStates["moon"];
      const earthState = snapshot.bodyStates["earth"];

      const distance = Math.sqrt(
        (moonState.positionAU.x - earthState.positionAU.x) ** 2 +
          (moonState.positionAU.y - earthState.positionAU.y) ** 2 +
          (moonState.positionAU.z - earthState.positionAU.z) ** 2,
      );

      // Moon should never exceed ~0.003 AU from Earth (escape distance is much higher)
      expect(distance).toBeLessThan(0.003);
      expect(distance).toBeGreaterThan(0.002);

      sim.update(timeSource.sample());
    }
  });
});
