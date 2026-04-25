export interface TimeContext {
  nowSeconds: number;
  deltaSeconds: number;
  tick: number;
}

export interface TimeSource {
  sample(): TimeContext;
}
