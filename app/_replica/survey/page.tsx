"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { SurveyItem, SurveyLabel, SurveyPayload } from "@/lib/survey/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 설문 보상 — 마이비 survey.myb.im 오프라인 렌더 DOM 복제. 상태바 50 제외, 헤더 60.
 * 상단 흰 블록 110 · 프리패스 띠 35 · 캐러셀 카드 342×172 r20 · 기초 설문 166×128 · 가볍게 127×227 · Hot 카드 r20 · 전체 리스트 카드 r20
 */
const SHADOW = "0 5px 16px 0 rgba(40, 24, 14, 0.09)";

export default function SurveyPage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<SurveyPayload | null>(null);
  useEffect(() => {
    fetch("/api/survey", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  const go = () => show("설문 제공사 페이지로 이동해요 (CPX 연동 예정)", "info");

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[#191f28]">
      <header className="relative z-[99] flex h-[60px] items-center justify-center bg-white py-4">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-[60px] items-center justify-center">
          <img src="/myb/survey/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="flex h-7 flex-1 items-center justify-center text-center text-[16px] font-medium">설문 보상</h1>
        <span className="flex h-7 w-[60px] items-center justify-center"><img src="/myb/survey/ic_question.png" width={24} height={24} alt="안내" className="h-6 w-6" /></span>
      </header>

      <div className="flex flex-col items-center">
        {/* 상단 110 */}
        <div className="flex h-[110px] w-full flex-col bg-white px-6 pb-6 pt-5">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <p className="text-[16px] font-medium leading-[19px] text-[#5c6573]">오늘 설문 참여하면</p>
              <div className="mt-4 flex items-center gap-2">
                <img src="/myb/survey/ic_bpoint.png" width={25} height={25} alt="" className="h-[25px] w-[25px]" />
                <span className="text-[26px] font-semibold leading-[30px] tabular-nums">{fmt(data?.totalAvailable ?? 0)}</span>
                <span className="text-[16px] font-medium leading-[19px] text-[#5c6573]">적립 가능</span>
              </div>
            </div>
            <button type="button" className="flex items-center gap-[5px] rounded-[100px] border border-[#dee2e9] px-3 py-2 text-[13px] font-medium leading-[15px] text-[#5c6573]">참여 내역</button>
          </div>
        </div>

        {/* 프리패스 띠 35 */}
        <button type="button" className="relative flex h-[35px] w-full items-center justify-center pb-2 pl-[10px] pr-[10px] pt-[7px]" style={{ background: "linear-gradient(90deg, rgb(157, 4, 175) 0%, rgb(240, 65, 120) 100%)" }}>
          <span className="flex items-center gap-1">
            <img src="/myb/survey/ic_freepass.png" width={20} height={20} alt="" className="h-5 w-5" />
            <span className="text-[14px] leading-4 text-white"><span className="font-medium">이제는 설문해도 </span><span className="font-bold">프리패스 받을 수 있어요!</span></span>
          </span>
          <img src="/myb/survey/ic_arrow_history.png" width={22} height={22} alt="" className="absolute right-3 top-[7px] h-[22px] w-[22px]" />
        </button>
        <div className="h-7" />

        {/* 기간 한정 보상 캐러셀 */}
        <div className="flex w-full flex-col items-center pb-10">
          <Swiper modules={[Pagination]} pagination={{ el: ".survey-dots", clickable: true, bulletClass: "survey-dot", bulletActiveClass: "survey-dot-on" }} loop={(data?.featured.length ?? 0) > 1} className="w-full">
            {(data?.featured ?? [{ id: "sk", title: "", loi: 0, reward: 0, labels: [], participants: null }]).map((s) => (
              <SwiperSlide key={s.id}>
                <div className="mb-5 px-6">
                  <div className="relative pt-4">
                    <div className="relative flex flex-col gap-[14px] rounded-[20px] border border-transparent bg-white p-6" style={{ boxShadow: SHADOW, backgroundImage: "linear-gradient(white, white), linear-gradient(92deg, rgb(0, 177, 255), rgb(0, 123, 255))", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}>
                      <div className="flex items-center justify-between"><p className="text-[14px] font-medium leading-[16.1px] text-[#5c6573]">기간 한정 보상 이벤트💝</p></div>
                      <div className="flex flex-col">
                        <p className="truncate pb-3 text-[18px] font-semibold leading-[20.7px]">{s.title || "…"}</p>
                        <p className="text-[13px] leading-[14.95px] text-[#8b94a0]">지금까지 <b className="font-semibold">{fmt(s.participants ?? 0)}명 이상</b>이 참여했어요!</p>
                        <div className="flex items-center justify-between gap-[6px] pt-5">
                          <span className="flex items-center gap-1"><img src="/myb/survey/ic_bpoint.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" /><span className="text-[18px] font-semibold leading-[20.7px] text-[var(--color-myb)]">{fmt(s.reward)}</span></span>
                          <TimeChip loi={s.loi} />
                        </div>
                      </div>
                    </div>
                    <span className="absolute left-5 top-0 flex h-7 items-center justify-center rounded-full py-[6px] pl-2 pr-[10px] text-[14px] font-semibold leading-[16.1px] text-white" style={{ background: "linear-gradient(92deg, rgb(0, 177, 255) 0%, rgb(0, 123, 255) 100%)" }}>
                      ✨한정 보상 <span className="ml-1 text-[#ffe838]">+20%</span>
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="survey-dots flex h-2 items-center justify-center gap-3" />
        </div>

        {/* 기초 설문 */}
        <div className="flex w-full flex-col gap-5">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-[20px] font-medium leading-6"><span className="text-[var(--color-myb)]">기초 설문</span> 참여하세요💡</h2>
            <img src="/myb/survey/ic_question.png" width={24} height={24} alt="안내" className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-[10px] px-6 pb-11">
            {(data?.profiling ?? []).map((s) => (
              <button key={s.id} type="button" onClick={go} className="flex h-32 min-w-0 flex-1 basis-0 items-center justify-between gap-3 rounded-[20px] border border-[#aac4ff] bg-white pb-5 pl-[18px] pr-[14px] pt-[18px] text-left">
                <div className="flex min-w-0 flex-col justify-center overflow-hidden">
                  <div className="flex items-center gap-[6px]">{s.labels[0] && <Label l={s.labels[0]} small />}</div>
                  <p className="truncate py-3 text-[18px] font-medium leading-[20.7px]">{s.title}</p>
                  <div className="flex items-center gap-1"><img src="/myb/survey/ic_bpoint.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" /><span className="pb-[2px] text-[18px] font-semibold">{fmt(s.reward)}</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 가볍게 참여해 보세요 */}
        <div className="flex w-full flex-col pb-11">
          <h2 className="px-6 text-[20px] font-medium leading-6">가볍게 참여해 보세요 🌟</h2>
          <div className="no-scrollbar flex items-center gap-[10px] overflow-x-auto px-6 pt-5">
            {(data?.light ?? []).map((s, i) => (
              <button key={s.id} type="button" onClick={go} className="relative flex h-[227px] w-[127px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white px-4 pb-[18px] pt-4">
                <img src={`/myb/survey/ic_research${(i % 4) + 1}.png`} width={54} height={54} alt="" className="h-[54px] w-[54px]" />
                <div className="flex items-center justify-center pb-2 pt-3"><TimeChip loi={s.loi} /></div>
                <p className="mb-4 line-clamp-2 h-12 w-[95px] whitespace-pre-line text-center text-[16px] font-medium leading-6">{s.title}</p>
                <span className="flex items-center gap-[3px] rounded-lg bg-[var(--color-myb)] px-3 py-2"><img src="/myb/survey/ic_bpoint4.png" width={14} height={14} alt="" className="h-[14px] w-[14px]" /><span className="text-[14px] font-semibold leading-4 text-white">{fmt(s.reward)}</span></span>
              </button>
            ))}
          </div>
        </div>

        {/* 지금 가장 Hot한 설문 */}
        <div className="flex w-full flex-col gap-5 px-6 pb-[46px]">
          <h2 className="text-[20px] font-medium leading-6">지금 가장 Hot한 설문 🔥</h2>
          <div className="flex flex-col gap-5 rounded-[20px] bg-white px-5 pb-6 pt-5" style={{ boxShadow: SHADOW }}>
            {(data?.hot ?? []).map((s, i) => (
              <button key={s.id} type="button" onClick={go} className="flex h-16 items-center justify-between gap-[10px] py-[6px] text-left">
                <div className="flex min-w-0 items-center gap-[10px]">
                  <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center">
                    {i < 3 ? <img src={`/myb/survey/ic_medal_${["gold", "silver", "bronze"][i]}.png`} width={34} height={34} alt="" className="h-[34px] w-[34px]" /> : <span className="text-center text-[18px] font-semibold text-[#8b94a0]">{i + 1}</span>}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-[10px]">
                    <p className="truncate text-[16px] font-medium leading-[19px]">{s.title}</p>
                    <div className="flex items-center gap-1">
                      <TimeChip loi={s.loi} bare />
                      {s.labels[0] && <Label l={s.labels[0]} pill />}
                    </div>
                  </div>
                </div>
                <span className="flex h-[26px] shrink-0 items-center gap-[3px] rounded-full bg-[var(--color-myb)] px-2 py-[5px]"><img src="/myb/survey/ic_bpoint4.png" width={14} height={14} alt="" className="h-[14px] w-[14px]" /><span className="text-[14px] font-semibold leading-4 text-white">{fmt(s.reward)}</span></span>
              </button>
            ))}
          </div>
        </div>

        {/* 전체 설문 리스트 */}
        <div className="flex w-full flex-col gap-5">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-[20px] font-medium leading-6">전체 설문 리스트</h2>
            <button type="button" className="flex h-[26px] items-center justify-center gap-[3px] rounded-full border border-[#e3e3e3] px-[10px] py-[5px]"><span className="text-[12px] font-medium leading-[14px] opacity-[0.64]">더보기</span><img src="/myb/survey/ic_arrow_seemore.png" width={6} height={11} alt="" className="h-[11px] w-[6px]" /></button>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-10">
            {(data?.all ?? []).map((s) => (
              <button key={s.id} type="button" onClick={go} className="flex flex-col gap-[14px] rounded-[20px] bg-white px-6 pb-5 pt-4 text-left">
                <div className="flex justify-between">
                  <div className="flex items-center gap-[6px]">{s.labels.map((l) => <Label key={l.text} l={l} />)}</div>
                  <span className="text-center text-[12px] font-medium leading-[14px] text-[#ec58d4]">즉시 적립</span>
                </div>
                <p className="truncate text-[16px] font-medium leading-[19px]">{s.title}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><img src="/myb/survey/ic_bpoint.png" width={16} height={16} alt="" className="h-4 w-4" /><span className="text-[16px] font-semibold leading-[19px]">{fmt(s.reward)}</span></span>
                  {s.loi > 0 && <TimeChip loi={s.loi} />}
                </div>
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="flex h-[91px] w-full items-center justify-center px-5 pb-[54px] pt-5 text-center text-[14px] font-medium text-[#5c6573]">전체 설문 리스트 보기</button>
      </div>
    </div>
  );
}

/** survey.myb.im 표시 분 = ceil(loi × 0.7): 12→9, 13→10, 10→7, 9→7, 1→1 (캡처 DOM 대조로 역산) */
function TimeChip({ loi, bare = false }: { loi: number; bare?: boolean }) {
  const min = Math.max(1, Math.ceil(loi * 0.7));
  return (
    <span className={`flex ${bare ? "h-[23px]" : "h-6"} items-center justify-center gap-[2px] rounded-full bg-[var(--color-myb-soft)] py-1 pl-[6px] pr-[7px]`}>
      {!bare && <img src="/myb/survey/ic_clock.png" width={16} height={16} alt="" className="h-4 w-4" />}
      <span className="text-[13px] font-medium leading-[14.95px] text-[var(--color-myb)]">{min}분</span>
    </span>
  );
}

function Label({ l, small = false, pill = false }: { l: SurveyLabel; small?: boolean; pill?: boolean }) {
  const cls = pill ? "h-5 rounded-full px-[6px] py-[3px] leading-[14px]" : small ? "h-5 rounded pb-1 pl-1 pr-[6px] pt-[2px] leading-[14px]" : "h-[22px] rounded px-[6px] py-1 leading-[14px]";
  return (
    <span className={`flex items-center justify-center whitespace-nowrap text-[12px] font-medium ${cls}`} style={{ background: l.bg, color: l.color }}>
      {l.text}
    </span>
  );
}
export type { SurveyItem };
