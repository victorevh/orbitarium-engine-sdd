import type { TimeContext, TimeSource } from "../../src/core/time/time-source";

export class TestTimeSource implements TimeSource {
  private tick = 0;

  constructor(private nowSeconds = 0, private deltaSeconds = 1 / 60) {}

  sample(): TimeContext {
    this.tick += 1;
    this.nowSeconds += this.deltaSeconds;

    return {
      nowSeconds: this.nowSeconds,
      deltaSeconds: this.deltaSeconds,
      tick: this.tick,
    };
  }
}
