import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 배포 커밋을 번들에 박아 두고(/api/version 과 비교) 옛 번들을 쓰는 화면을 자동 새로고침한다
  env: { NEXT_PUBLIC_COMMIT: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
  // Supabase 서비스 키는 서버에서만 읽는다. 클라이언트 번들로 새지 않도록 NEXT_PUBLIC_ 접두사를 쓰지 않는다.
};

export default nextConfig;
