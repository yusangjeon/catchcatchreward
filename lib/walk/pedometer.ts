"use client";

/**
 * 브라우저 보행 감지(DeviceMotion). 화면이 켜져 있고 앱이 열려 있는 동안만 센다.
 * 알고리즘: 가속도 크기(중력 포함) → 지수 이동평균으로 중력 성분 제거 → 임계값(1.1 m/s²) 위로 올라가는 피크를 걸음으로 인정, 최소 간격 280ms.
 * iOS 13+ 는 사용자 제스처 안에서 DeviceMotionEvent.requestPermission() 이 필요하다.
 */
export type PedometerState = "idle" | "need-permission" | "running" | "unsupported" | "denied";

export class Pedometer {
  private gravity = 9.81;
  private lastStepAt = 0;
  private above = false;
  private handler = (e: DeviceMotionEvent) => this.onMotion(e);
  steps = 0;
  state: PedometerState = "idle";
  onStep: ((steps: number) => void) | null = null;

  static supported() { return typeof window !== "undefined" && "DeviceMotionEvent" in window; }
  static needsPermission() {
    const D = (typeof window !== "undefined" ? (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent : undefined);
    return !!D && typeof D.requestPermission === "function";
  }

  async start(): Promise<PedometerState> {
    if (!Pedometer.supported()) return (this.state = "unsupported");
    if (Pedometer.needsPermission()) {
      try {
        const D = (window as unknown as { DeviceMotionEvent: { requestPermission: () => Promise<string> } }).DeviceMotionEvent;
        const r = await D.requestPermission();
        if (r !== "granted") return (this.state = "denied");
      } catch { return (this.state = "denied"); }
    }
    window.addEventListener("devicemotion", this.handler);
    return (this.state = "running");
  }
  stop() { window.removeEventListener("devicemotion", this.handler); if (this.state === "running") this.state = "idle"; }

  private onMotion(e: DeviceMotionEvent) {
    const a = e.accelerationIncludingGravity; if (!a || a.x == null || a.y == null || a.z == null) return;
    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    this.gravity = this.gravity * 0.9 + mag * 0.1; // 느린 추적 = 중력 추정
    const d = mag - this.gravity;
    const now = performance.now();
    if (!this.above && d > 1.1) {
      this.above = true;
      if (now - this.lastStepAt > 280) { this.lastStepAt = now; this.steps += 1; this.onStep?.(this.steps); }
    } else if (this.above && d < 0.3) this.above = false;
  }
}
