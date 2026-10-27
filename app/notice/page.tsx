import { GameHeader } from "@/components/games/GameHeader";

const NOTICES = [
  { date: "2026-10-27", title: "미니게임 5종 오픈 — 틀린그림 찾기·2048·복권·가위바위보·브랜드 짝 맞추기", body: "매일 0시에 리셋돼요. 게임 보상은 하루 한도가 있고, 3회 플레이하면 러쉬 스탬프 미션이 채워져요." },
  { date: "2026-10-27", title: "캐치 러쉬 시작 — 매주 미션 8개, 스탬프 7개 300P · 8개 500P", body: "일요일 0시에 새 주차가 시작돼요. 받지 않은 보상은 주차가 바뀌면 사라지니 토요일 안에 꼭 받아 주세요." },
  { date: "2026-10-27", title: "친구초대 보상 안내", body: "친구가 내 코드를 입력하면 친구 300P, 친구가 첫 퀴즈를 완료하면 나에게 500P가 적립돼요(하루 5명)." },
  { date: "2026-10-25", title: "캐치캐치리워드 베타 오픈", body: "취향 퀴즈로 포인트를 모으고, 배지를 모아 나만의 취향을 확인해 보세요. 포인트는 1,000P부터 기프티콘으로 교환할 수 있어요." },
];

export default function NoticePage() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="공지사항" />
      <ul className="flex flex-col gap-3 px-5 pt-[64px]">
        {NOTICES.map((n, i) => (
          <li key={i} className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
            <p className="text-[11px] text-[#8b94a0]">{n.date}</p>
            <p className="mt-1 text-[15px] font-bold leading-[22px]">{n.title}</p>
            <p className="mt-2 text-[13px] leading-[20px] text-[#5c6573]">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
