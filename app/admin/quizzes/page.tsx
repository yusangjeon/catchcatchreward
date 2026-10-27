import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { createQuizAction, createSetAction, toggleSetAction } from "../actions";

export default async function AdminQuizzes() {
  await requireAdmin();
  const repo = getRepo();
  const [sets, counts, badges] = await Promise.all([repo.listAllSets(), repo.countCompletionsBySet(), repo.listBadges()]);
  const quizCounts = Object.fromEntries(await Promise.all(sets.map(async (s) => [s.id, (await repo.listQuizzesBySet(s.id)).length] as const)));
  const input = "h-10 rounded-lg border border-[#dee2e9] px-3 text-[14px]";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">퀴즈 세트</h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[var(--color-bg)] text-[12px] text-[#8b94a0]">
            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">제목</th><th className="px-4 py-3">보상</th><th className="px-4 py-3">문항</th><th className="px-4 py-3">완료</th><th className="px-4 py-3">오늘만</th><th className="px-4 py-3">타깃</th><th className="px-4 py-3">상태</th></tr>
          </thead>
          <tbody>
            {sets.map((s) => (
              <tr key={s.id} className="border-t border-[var(--color-bg-2)]">
                <td className="px-4 py-3 font-mono text-[12px] text-[#5c6573]">{s.id}</td>
                <td className="px-4 py-3">{s.title}</td>
                <td className="px-4 py-3 tabular-nums">{s.rewardPoints}P</td>
                <td className="px-4 py-3 tabular-nums">{quizCounts[s.id] ?? 0}</td>
                <td className="px-4 py-3 tabular-nums">{counts[s.id] ?? 0}</td>
                <td className="px-4 py-3">{s.todayOnly ? "예" : "-"}</td>
                <td className="px-4 py-3 text-[12px]">{s.targetBadges?.length ? s.targetBadges.map((c) => badges.find((b) => b.code === c)?.name ?? c).join(", ") : <span className="text-[#b0b8c1]">전체</span>}</td>
                <td className="px-4 py-3">
                  <form action={toggleSetAction} className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={s.active ? "0" : "1"} />
                    <button type="submit" className={`rounded-full px-3 py-1 text-[12px] font-semibold ${s.active ? "bg-[#e7faf5] text-[#00b795]" : "bg-[var(--color-bg-2)] text-[#8b94a0]"}`}>{s.active ? "활성 · 끄기" : "비활성 · 켜기"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form action={createSetAction} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-[16px] font-bold">세트 등록</h2>
          <input name="title" required placeholder="제목 (예: 짜장면 vs 짬뽕)" className={input} />
          <input name="imageUrl" placeholder="이미지 URL (비우면 placeholder)" className={input} />
          <div className="grid grid-cols-3 gap-2">
            <input name="rewardPoints" type="number" defaultValue={100} placeholder="보상 P" className={input} />
            <input name="capacity" type="number" defaultValue={5000} placeholder="정원" className={input} />
            <input name="sort" type="number" defaultValue={99} placeholder="정렬" className={input} />
          </div>
          <label className="flex items-center gap-2 text-[14px]"><input name="todayOnly" type="checkbox" /> 오늘만 배지</label>
          <fieldset className="rounded-lg border border-[#e3e8f0] p-3">
            <legend className="px-1 text-[12px] text-[#8b94a0]">타깃 배지(세그먼트) — 선택하면 해당 배지 보유 유저에게만 노출</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
              {badges.map((b) => <label key={b.code} className="flex items-center gap-1.5"><input type="checkbox" name="targetBadges" value={b.code} /> {b.emoji} {b.name}</label>)}
            </div>
          </fieldset>
          <button type="submit" className="h-10 rounded-lg bg-[var(--color-myb)] text-[14px] font-bold text-white">세트 추가</button>
        </form>
        <form action={createQuizAction} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-[16px] font-bold">문항 등록</h2>
          <select name="setId" className={input}>{sets.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}</select>
          <input name="question" required placeholder="질문 (줄바꿈은 \n)" className={input} />
          <textarea name="options" required rows={4} placeholder={"선택지 줄당: 라벨 | 태그1,태그2 | 이미지URL(선택)\n2줄이면 2지선다(이미지 카드), 3~4줄이면 객관식"} className="rounded-lg border border-[#dee2e9] px-3 py-2 text-[14px]" />
          <button type="submit" className="h-10 rounded-lg bg-[var(--color-myb)] text-[14px] font-bold text-white">문항 추가</button>
        </form>
      </div>
    </div>
  );
}
