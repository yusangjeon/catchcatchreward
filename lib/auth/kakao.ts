import "server-only";

/**
 * 카카오 로그인(REST). 필요 env: KAKAO_REST_API_KEY, (선택) KAKAO_CLIENT_SECRET, APP_BASE_URL(없으면 요청 origin).
 * developers.kakao.com → 앱 → 카카오 로그인 활성화 → Redirect URI 에 `${APP_BASE_URL}/api/auth/kakao/callback` 등록 → 동의항목 닉네임·프로필 사진.
 */
export function kakaoEnabled(): boolean {
  return !!process.env.KAKAO_REST_API_KEY;
}

export function kakaoAuthorizeUrl(redirectUri: string, state: string): string {
  const u = new URL("https://kauth.kakao.com/oauth/authorize");
  u.searchParams.set("client_id", process.env.KAKAO_REST_API_KEY ?? "");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", state);
  return u.toString();
}

export interface KakaoUser {
  id: string;
  nickname?: string;
  avatarUrl?: string;
}

export async function kakaoExchange(code: string, redirectUri: string): Promise<KakaoUser> {
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: process.env.KAKAO_REST_API_KEY ?? "", redirect_uri: redirectUri, code });
  if (process.env.KAKAO_CLIENT_SECRET) body.set("client_secret", process.env.KAKAO_CLIENT_SECRET);
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" }, body });
  if (!tokenRes.ok) throw new Error(`kakao token ${tokenRes.status}: ${(await tokenRes.text()).slice(0, 200)}`);
  const token = (await tokenRes.json()) as { access_token: string };
  const meRes = await fetch("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!meRes.ok) throw new Error(`kakao me ${meRes.status}`);
  const me = (await meRes.json()) as { id: number; properties?: { nickname?: string; profile_image?: string; thumbnail_image?: string }; kakao_account?: { profile?: { nickname?: string; thumbnail_image_url?: string; profile_image_url?: string } } };
  return {
    id: String(me.id),
    nickname: me.kakao_account?.profile?.nickname ?? me.properties?.nickname,
    avatarUrl: me.kakao_account?.profile?.thumbnail_image_url ?? me.properties?.thumbnail_image ?? me.kakao_account?.profile?.profile_image_url,
  };
}
