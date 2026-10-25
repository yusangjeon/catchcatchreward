"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* eslint-disable @next/next/no-img-element */

type ToastMsg = { id: number; text: string; icon?: "point" | "info" };
type Ctx = { show: (text: string, icon?: ToastMsg["icon"]) => void };

const ToastCtx = createContext<Ctx>({ show: () => {} });
export const useToast = () => useContext(ToastCtx);

const AUTO_CLOSE = 3000; // react-toastify 기본값
const OUT_MS = 750; // Toastify bounce 애니메이션 길이

/**
 * 마이비 benefit-hub 토스트 복제: react-toastify(top-center, bounce) + 커스텀 스타일
 * bg #293a60 · radius 100 · padding 12 26 12 12 · gap 10 · 14/500 white · 아이콘 30px(ic_toast_point / ic_toast_info)
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<(ToastMsg & { leaving: boolean })[]>([]);
  const seq = useRef(0);

  const show = useCallback((text: string, icon: ToastMsg["icon"] = "point") => {
    const id = ++seq.current;
    setItems((xs) => [...xs, { id, text, icon, leaving: false }]);
    setTimeout(() => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, leaving: true } : x))), AUTO_CLOSE);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), AUTO_CLOSE + OUT_MS);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-[430px] -translate-x-1/2 flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`myb-toast ${t.leaving ? "myb-toast-out" : "myb-toast-in"} pointer-events-auto flex w-fit items-center justify-center gap-[10px] rounded-[100px] bg-[#293a60] py-3 pl-3 pr-[26px] text-[14px] font-medium text-white`}
          >
            <img src={t.icon === "info" ? "/myb/bh/ic_toast_info.webp" : "/myb/bh/ic_toast_point.webp"} width={30} height={30} alt="" className="mr-[10px] h-[30px] w-[30px] shrink-0" />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** 마운트 시 1회 토스트(보상 화면 등) */
export function ToastOnMount({ text, icon }: { text: string; icon?: ToastMsg["icon"] }) {
  const { show } = useToast();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    show(text, icon);
  }, [show, text, icon]);
  return null;
}
