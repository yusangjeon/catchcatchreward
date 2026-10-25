import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "캐치캐치리워드",
  description: "쉽고 간편하게 즐기는 퀴즈형 앱테크",
  applicationName: "캐치캐치리워드",
  appleWebApp: { capable: true, title: "캐치캐치리워드", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#427dff",
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
