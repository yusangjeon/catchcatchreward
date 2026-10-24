import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "캐치캐치리워드",
  description: "취향 퀴즈 풀고 포인트 받고, 스탬프 모아 룰렛 돌리기",
  applicationName: "캐치캐치리워드",
  appleWebApp: { capable: true, title: "캐치캐치리워드", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff6b35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
