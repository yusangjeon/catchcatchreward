import { GameHeader } from "@/components/games/GameHeader";

const FAQ = [
  ["포인트는 언제 적립되나요?", "퀴즈·출석·미니게임 보상은 즉시 적립돼요. 쇼핑적립은 제휴사 구매 확정 후(보통 30~60일) 반영돼요."],
  ["교환 신청 후 얼마나 걸리나요?", "영업일 기준 1~3일 안에 처리돼요. 반려되면 포인트는 자동으로 돌아와요."],
  ["꿀이 뭔가요?", "하루에 풀 수 있는 퀴즈 횟수예요. 매일 0시에 8개로 충전돼요."],
  ["폰을 바꾸면 포인트가 사라지나요?", "MY에서 카카오로 로그인해 두면 계정에 연결돼 폰을 바꿔도 그대로 이어져요."],
  ["부정 참여는 어떻게 되나요?", "같은 기기 다중 계정, 매크로 등이 확인되면 보상이 회수되고 이용이 제한될 수 있어요."],
];

export default function SupportPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="고객센터" />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <h2 className="text-[15px] font-bold">문의하기</h2>
          <p className="mt-2 text-[13px] leading-[20px] text-[#5c6573]">이메일 <b className="select-all text-[#191f28]">amplify15813@gmail.com</b><br />운영시간 평일 10:00~18:00 (주말·공휴일 제외)</p>
          <a href="mailto:amplify15813@gmail.com?subject=[캐치캐치리워드] 문의" className="mt-3 inline-flex h-10 items-center rounded-lg bg-[#191f28] px-4 text-[13px] font-bold text-white">이메일 보내기</a>
        </section>
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <h2 className="text-[15px] font-bold">자주 묻는 질문</h2>
          <ul className="mt-2 divide-y divide-[var(--color-bg-2)]">
            {FAQ.map(([q, a]) => (
              <li key={q} className="py-3"><details><summary className="cursor-pointer text-[14px] font-semibold">{q}</summary><p className="mt-2 text-[13px] leading-[20px] text-[#5c6573]">{a}</p></details></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
