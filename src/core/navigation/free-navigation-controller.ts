import type { NavigationState } from "../models";
import type { TimeContext } from "../time/time-source";
import type { Quaternion, Vector3 } from "../types";

type FreeControlKey = "w" | "a" | "s" | "d" | "q" | "e";

const DEFAULT_MOVE_SPEED = 30;
const DEFAULT_LOOK_SENSITIVITY = 0.0025;

const add = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

const scale = (v: Vector3, amount: number): Vector3 => ({ x: v.x * amount, y: v.y * amount, z: v.z * amount });

const magnitude = (v: Vector3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

const normalizeVector = (v: Vector3): Vector3 => {
  const length = magnitude(v);
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return scale(v, 1 / length);
};

const multiplyQuaternion = (a: Quaternion, b: Quaternion): Quaternion => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});

const normalizeQuaternion = (q: Quaternion): Quaternion => {
  const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  if (length === 0) {
    return { x: 0, y: 0, z: 0, w: 1 };
  }

  return {
    x: q.x / length,
    y: q.y / length,
    z: q.z / length,
    w: q.w / length,
  };
};

const quaternionFromAxisAngle = (axis: Vector3, angle: number): Quaternion => {
  const unitAxis = normalizeVector(axis);
  const halfAngle = angle * 0.5;
  const sinHalf = Math.sin(halfAngle);

  return {
    x: unitAxis.x * sinHalf,
    y: unitAxis.y * sinHalf,
    z: unitAxis.z * sinHalf,
    w: Math.cos(halfAngle),
  };
};

const rotateVectorByQuaternion = (vector: Vector3, quaternion: Quaternion): Vector3 => {
  const qVector: Quaternion = { x: vector.x, y: vector.y, z: vector.z, w: 0 };
  const qConjugate: Quaternion = { x: -quaternion.x, y: -quaternion.y, z: -quaternion.z, w: quaternion.w };
  const rotated = multiplyQuaternion(multiplyQuaternion(quaternion, qVector), qConjugate);
  return { x: rotated.x, y: rotated.y, z: rotated.z };
};

export class FreeNavigationController {
  private readonly keyState: Record<FreeControlKey, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
  };

  private pendingMouseDelta = { x: 0, y: 0 };

  setKeyState(key: string, pressed: boolean): void {
    const normalizedKey = key.toLowerCase() as FreeControlKey;
    if (!(normalizedKey in this.keyState)) {
      return;
    }

    this.keyState[normalizedKey] = pressed;
  }

  applyMouseDelta(deltaX: number, deltaY: number): void {
    this.pendingMouseDelta.x += deltaX;
    this.pendingMouseDelta.y += deltaY;
  }

  update(state: NavigationState, time: TimeContext): NavigationState {
    const nextOrientation = this.applyLook(state.orientation);
    const movement = this.resolveMovement(nextOrientation);
    const movementLength = magnitude(movement);

    const normalizedMovement = movementLength > 1 ? scale(movement, 1 / movementLength) : movement;
    const displacement = scale(normalizedMovement, DEFAULT_MOVE_SPEED * time.deltaSeconds);
    const nextPosition = add(state.position, displacement);

    return {
      ...state,
      position: nextPosition,
      orientation: nextOrientation,
      lastUpdateTick: time.tick,
    };
  }

  private applyLook(orientation: Quaternion): Quaternion {
    if (this.pendingMouseDelta.x === 0 && this.pendingMouseDelta.y === 0) {
      return orientation;
    }

    const yaw = quaternionFromAxisAngle({ x: 0, y: 1, z: 0 }, -this.pendingMouseDelta.x * DEFAULT_LOOK_SENSITIVITY);
    const yawedOrientation = normalizeQuaternion(multiplyQuaternion(yaw, orientation));
    const rightAxis = rotateVectorByQuaternion({ x: 1, y: 0, z: 0 }, yawedOrientation);
    const pitch = quaternionFromAxisAngle(rightAxis, -this.pendingMouseDelta.y * DEFAULT_LOOK_SENSITIVITY);
    const oriented = normalizeQuaternion(multiplyQuaternion(pitch, yawedOrientation));

    this.pendingMouseDelta = { x: 0, y: 0 };
    return oriented;
  }

  private resolveMovement(orientation: Quaternion): Vector3 {
    const forward = rotateVectorByQuaternion({ x: 0, y: 0, z: -1 }, orientation);
    const right = rotateVectorByQuaternion({ x: 1, y: 0, z: 0 }, orientation);
    const up = rotateVectorByQuaternion({ x: 0, y: 1, z: 0 }, orientation);

    const forwardAxis = (this.keyState.w ? 1 : 0) - (this.keyState.s ? 1 : 0);
    const rightAxis = (this.keyState.d ? 1 : 0) - (this.keyState.a ? 1 : 0);
    const upAxis = (this.keyState.e ? 1 : 0) - (this.keyState.q ? 1 : 0);

    return add(add(scale(forward, forwardAxis), scale(right, rightAxis)), scale(up, upAxis));
  }
}
