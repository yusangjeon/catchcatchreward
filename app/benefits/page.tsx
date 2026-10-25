import { PCoin } from "@/components/icons";

/** 혜택 탭 — 오퍼월 지면 자리(2차 SDK 연동). 레퍼런스 화면 없음, 구조만 */
const ITEMS = [
  { icon: "📅", title: "매일 출석체크", sub: "하루 한 번 출석하고 포인트", p: 10 },
  { icon: "📺", title: "광고 보고 포인트", sub: "30초 영상 시청", p: 20 },
  { icon: "🛍️", title: "쇼핑 적립", sub: "제휴 쇼핑몰 경유 구매 시 적립", p: 500 },
  { icon: "📍", title: "매장 방문 미션", sub: "네이버 플레이스 저장·리뷰", p: 300 },
  { icon: "📱", title: "앱 설치 미션", sub: "설치하고 실행하면 바로 적립", p: 1000 },
];

export default function BenefitsPage() {
  return (
    <div className="px-5 pt-5">
      <h1 className="text-[27px] font-bold">혜택</h1>
      <ul className="mt-5 flex flex-col gap-3">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex items-center gap-4 rounded-2xl border border-[#e3e8f0] p-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-2 text-[28px]" aria-hidden>{it.icon}</span>
            <div className="flex-1">
              <p className="text-[16px] font-bold">{it.title}</p>
              <p className="mt-0.5 text-[13px] text-muted">{it.sub}</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-myb-soft px-3 py-2 text-[15px] font-extrabold text-myb-dark"><PCoin size={16} />{it.p.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-[12px] text-muted">오퍼월 연동 준비 중이에요.</p>
    </div>
  );
}
