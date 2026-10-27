"use client";

import { useEffect } from "react";

/**
 * 새 배포 감지 → 자동 새로고침. 홈 화면 앱(PWA)처럼 오래 떠 있는 화면이 옛 번들을 계속 쓰는 문제 방지.
 * 번들에 박힌 커밋(NEXT_PUBLIC_COMMIT)과 /api/version 의 커밋이 다르면 포커스 복귀/90초 주기 때 location.reload().
 */
const MINE = process.env.NEXT_PUBLIC_COMMIT ?? "dev";
export function BuildGuard() {
  useEffect(() => {
    if (MINE === "dev") return;
    let stop = false;
    const check = async () => {
      try {
        const r = await fetch("/api/version", { cache: "no-store" }); const j = await r.json();
        if (!stop && j.commit && j.commit !== MINE) location.reload();
      } catch {}
    };
    const onVis = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(check, 90_000);
    const t = setTimeout(check, 5_000);
    return () => { stop = true; document.removeEventListener("visibilitychange", onVis); clearInterval(id); clearTimeout(t); };
  }, []);
  return null;
}
