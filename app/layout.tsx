import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { ToastProvider } from "@/components/motion/Toast";
import { FxLayer } from "@/components/motion/FxLayer";
import { BuildGuard } from "@/components/BuildGuard";
import { RewardLayer } from "@/components/motion/RewardLayer";

export const metadata: Metadata = {
  title: "캐치캐치리워드",
  description: "쉽고 간편하게 즐기는 퀴즈형 앱테크",
  applicationName: "캐치캐치리워드",
  appleWebApp: { capable: true, title: "캐치캐치리워드", statusBarStyle: "default" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff5a2d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 마이비와 동일 서체: Pretendard Variable (jsDelivr CDN, 동적 서브셋) */}
        <link rel="preload" href="/fonts/PretendardVariable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <Shell>{children}</Shell>
          <FxLayer />
          <BuildGuard />
          <RewardLayer />
        </ToastProvider>
      </body>
    </html>
  );
}
