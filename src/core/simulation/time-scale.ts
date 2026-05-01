export class TimeScale {
  private simTimeDays = 0;
  private rate: number;

  constructor(simDaysPerRealSecond = 1) {
    this.rate = simDaysPerRealSecond;
  }

  advance(deltaSeconds: number): void {
    this.simTimeDays += deltaSeconds * this.rate;
  }

  getSimTimeDays(): number {
    return this.simTimeDays;
  }

  setRate(simDaysPerRealSecond: number): void {
    if (simDaysPerRealSecond <= 0) {
      throw new Error("simDaysPerRealSecond must be positive");
    }
    this.rate = simDaysPerRealSecond;
  }
}
