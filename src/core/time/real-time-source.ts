import type { TimeContext, TimeSource } from "./time-source";

const nowMillis = (): number => {
  if (typeof globalThis.performance !== "undefined" && typeof globalThis.performance.now === "function") {
    return globalThis.performance.now();
  }
  return Date.now();
};

export class RealTimeSource implements TimeSource {
  private previousSeconds: number | null = null;

  private tick = 0;

  sample(): TimeContext {
    const currentSeconds = nowMillis() / 1000;
    const deltaSeconds = this.previousSeconds === null ? 0 : Math.max(0, currentSeconds - this.previousSeconds);

    this.previousSeconds = currentSeconds;
    this.tick += 1;

    return {
      nowSeconds: currentSeconds,
      deltaSeconds,
      tick: this.tick,
    };
  }
}
