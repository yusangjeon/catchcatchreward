/** 단일 지표 일별 막대 차트(서버 컴포넌트, 인라인 SVG). 한 가지 색, 마지막 막대 강조, 값은 최댓값과 마지막만 직접 표기, 각 막대 hover 툴팁(title) */
export function DailyChart({ title, rows, unit }: { title: string; rows: { label: string; value: number }[]; unit: string }) {
  const W = 520, H = 150, padL = 8, padR = 8, padT = 22, padB = 24;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const n = rows.length;
  const slot = (W - padL - padR) / n;
  const bw = Math.max(6, slot - 6);
  const maxIdx = rows.findIndex((r) => r.value === max);
  const fmt = (v: number) => v.toLocaleString("ko-KR");
  const total = rows.reduce((a, r) => a + r.value, 0);
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[14px] font-bold">{title}</h3>
        <span className="text-[12px] text-[#8b94a0]">최근 {n}일 합계 <b className="tabular-nums text-[#191f28]">{fmt(total)}{unit}</b></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`${title} 최근 ${n}일`}>
        {[0.5, 1].map((f) => <line key={f} x1={padL} x2={W - padR} y1={padT + (H - padT - padB) * (1 - f)} y2={padT + (H - padT - padB) * (1 - f)} stroke="#eef0f4" strokeWidth={1} />)}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="#dee2e9" strokeWidth={1} />
        {rows.map((r, i) => {
          const h = Math.round(((H - padT - padB) * r.value) / max);
          const x = padL + i * slot + (slot - bw) / 2;
          const y = H - padB - h;
          const last = i === n - 1;
          const show = r.value > 0 && (i === maxIdx || last);
          return (
            <g key={r.label}>
              <title>{`${r.label} · ${fmt(r.value)}${unit}`}</title>
              <rect x={x} y={y} width={bw} height={h} rx={h > 0 ? 3 : 0} fill={last ? "var(--color-myb)" : "var(--color-myb-line)"} />
              {show && <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="#5c6573" className="tabular-nums">{fmt(r.value)}</text>}
              {(i % 2 === n % 2 || last) && <text x={x + bw / 2} y={H - 7} textAnchor="middle" fontSize={10} fill="#8b94a0">{r.label}</text>}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
