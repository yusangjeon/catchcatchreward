"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/motion/Toast";

type State = "loading" | "unsupported" | "disabled" | "denied" | "off" | "on";

function b64ToUint8(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** 푸시 알림 토글 — SW 등록 → 권한 → PushManager 구독 → 서버 저장. 테스트 발송 버튼 포함 */
export function PushToggle({ compact = false }: { compact?: boolean }) {
  const { show } = useToast();
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [pubKey, setPubKey] = useState("");

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return setState("unsupported");
    const info = await fetch("/api/push", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (!info?.enabled) return setState("disabled");
    setPubKey(info.publicKey);
    if (Notification.permission === "denied") return setState("denied");
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    setState(sub && info.subscriptions.includes(sub.endpoint) ? "on" : "off");
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function enable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); show("알림 권한이 거부됐어요. 브라우저 설정에서 허용해 주세요", "info"); return; }
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(pubKey) }));
      const res = await fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error((await res.json()).message ?? "구독 실패");
      setState("on");
      show("푸시 알림을 켰어요. 매일 아침 9시에 소식을 보내드려요");
    } catch (e) {
      show(e instanceof Error ? e.message : "알림 설정 실패", "info");
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState("off");
      show("푸시 알림을 껐어요", "info");
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    setBusy(true);
    try {
      const j = await fetch("/api/push/test", { method: "POST" }).then((r) => r.json());
      show(j.sent > 0 ? "테스트 알림을 보냈어요. 잠시 후 도착해요" : "보낼 기기가 없어요", j.sent > 0 ? undefined : "info");
    } finally {
      setBusy(false);
    }
  }

  const label = state === "on" ? "켜짐" : state === "off" ? "꺼짐" : state === "denied" ? "권한 거부됨" : state === "disabled" ? "서버 미설정" : state === "unsupported" ? "이 브라우저 미지원" : "…";
  return (
    <div className={`flex items-center gap-3 rounded-[16px] bg-white ${compact ? "px-4 py-3" : "px-4 py-[14px]"}`} style={{ boxShadow: "0 2px 10px 0 rgba(40, 24, 14, 0.06)" }}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-myb-soft)]"><img src="/brand/bell.webp" alt="" className="h-8 w-8 object-contain" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">푸시 알림 <span className={`ml-1 text-[12px] font-medium ${state === "on" ? "text-[#1aa260]" : "text-[#8b94a0]"}`}>{label}</span></p>
        <p className="mt-0.5 text-[12px] leading-[17px] text-[#8b94a0]">{state === "unsupported" ? "iPhone 은 홈 화면에 추가한 뒤 열면 받을 수 있어요" : "출석·퀴즈·받을 보상을 매일 아침 알려드려요"}</p>
      </div>
      {state === "on" ? (
        <div className="flex shrink-0 gap-1.5">
          <button type="button" disabled={busy} onClick={() => void test()} className="myb-press h-9 rounded-lg border border-[#dee2e9] px-3 text-[12px] font-bold">테스트</button>
          <button type="button" disabled={busy} onClick={() => void disable()} className="myb-press h-9 rounded-lg bg-[var(--color-bg-3)] px-3 text-[12px] font-bold text-[#5c6573]">끄기</button>
        </div>
      ) : (
        <button type="button" disabled={busy || state === "unsupported" || state === "disabled" || state === "loading"} onClick={() => void enable()} className="myb-press h-9 shrink-0 rounded-lg bg-[var(--color-myb)] px-4 text-[13px] font-bold text-white disabled:opacity-40">켜기</button>
      )}
    </div>
  );
}
