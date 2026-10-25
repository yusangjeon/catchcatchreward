"use client";

import { useEffect, useState } from "react";

function parts(endsAt: string, now: number) {
  const diff = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(diff / 86400_000);
  const h = Math.floor((diff % 86400_000) / 3600_000);
  const m = Math.floor((diff % 3600_000) / 60_000);
  return { d, h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0") };
}

/** 벤핏허브 상단 "2 일 0 9 시간 2 3 분 남았어요" 칩 카운트다운. 1분 간격 갱신 */
export function Countdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  const { d, h, m } = parts(endsAt, now);
  const chip = "flex h-[26px] items-center justify-center rounded-[6px] bg-white/20 text-[16px] font-semibold tabular-nums text-white";
  const unit = "text-[18px] font-semibold leading-[18px] text-white";
  return (
    <div className="flex h-[74px] items-center justify-center gap-[6px] bg-white/[0.08] py-6">
      <div className="flex items-center gap-[6px]">
        <div className="flex items-center gap-[3px]">
          <span className={`${chip} px-2`}>{d}</span>
          <span className={unit}>일</span>
        </div>
        <div className="flex items-center gap-[3px]">
          <div className="flex items-center gap-[2px]">
            {h.split("").map((c, i) => <span key={i} className={`${chip} w-[22px] px-[6px]`}>{c}</span>)}
          </div>
          <span className={unit}>시간</span>
        </div>
        <div className="flex items-center gap-[3px]">
          <div className="flex items-center gap-[2px]">
            {m.split("").map((c, i) => <span key={i} className={`${chip} w-[22px] px-[6px]`}>{c}</span>)}
          </div>
          <span className={unit}>분</span>
        </div>
      </div>
      <span className={`${unit} tracking-[-0.18px]`}>남았어요</span>
    </div>
  );
}
