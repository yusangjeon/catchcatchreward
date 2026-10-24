import Link from "next/link";

const PLANNED = [
  { icon: "❓", title: "오늘의 취향 퀴즈 5개", reward: "스탬프 1", status: "open" as const, href: "/quiz" },
  { icon: "🛍️", title: "제휴 쇼핑 3만원 이상 구매", reward: "스탬프 1", status: "soon" as const },
  { icon: "📍", title: "매장 방문 인증", reward: "스탬프 1 + 포인트", status: "soon" as const },
  { icon: "💾", title: "네이버 플레이스 저장", reward: "포인트", status: "soon" as const },
  { icon: "✍️", title: "방문 리뷰 작성", reward: "스탬프 1 + 포인트", status: "soon" as const },
];

export default function MissionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">미션</h1>
      <p className="text-sm text-ink-muted">미션을 완료하면 스탬프가 쌓여요. 스탬프 10개 = 룰렛 1회.</p>
      <ul className="flex flex-col gap-3">
        {PLANNED.map((m) => (
          <li key={m.title} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm">
            <span aria-hidden className="text-2xl">
              {m.icon}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{m.title}</p>
              <p className="text-xs text-ink-muted">보상: {m.reward}</p>
            </div>
            {m.status === "open" && m.href ? (
              <Link href={m.href} className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white">
                하러 가기
              </Link>
            ) : (
              <span className="rounded-lg bg-line px-3 py-2 text-xs font-semibold text-ink-muted">준비 중</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
