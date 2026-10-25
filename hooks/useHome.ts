"use client";

import { useCallback, useEffect, useState } from "react";
import type { HomePayload } from "@/lib/types";

export function useHome() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/home", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as HomePayload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, reload };
}

export const fmt = (n: number) => n.toLocaleString("ko-KR");
