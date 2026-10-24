import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Supabase 서비스 키는 서버에서만 읽는다. 클라이언트 번들로 새지 않도록 NEXT_PUBLIC_ 접두사를 쓰지 않는다.
};

export default nextConfig;
