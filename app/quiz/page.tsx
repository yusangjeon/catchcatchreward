"use client";

import { useHome } from "@/hooks/useHome";
import { SetGridCard } from "@/components/SetCard";

export default function QuizTabPage() {
  const { data } = useHome();
  const sets = data?.sets ?? [];
  return (
    <div className="px-5 pt-5">
      <h1 className="text-[22px] font-bold">
        <span className="text-myb-dark">{data ? data.persona.title : "…"}</span>님을 위한
      </h1>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7">
        {sets.length > 0
          ? sets.map((s) => <SetGridCard key={s.id} s={s} />)
          : [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-bg-2" />)}
      </div>
    </div>
  );
}
