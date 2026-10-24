"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodayQuizPayload } from "@/lib/types";

export function useToday() {
  const [data, setData] = useState<TodayQuizPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz/today", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as TodayQuizPayload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, reload, setData };
}
