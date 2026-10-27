import "server-only";
import { getRepo } from "@/lib/db";
import { getCurrentProfile, setSessionAnonKey } from "@/lib/user";
import type { Profile } from "@/lib/types";

/**
 * 소셜 계정으로 로그인 처리.
 *  - 그 계정이 처음이면: 지금 쓰던 익명 프로필에 계정을 연결(기록 그대로 유지)
 *  - 이미 연결된 프로필이 있으면: 익명 프로필의 기록을 그 프로필로 합치고(mergeProfiles) 세션을 그 프로필로 전환
 */
export async function loginWithProvider(provider: NonNullable<Profile["provider"]>, providerId: string, nickname?: string, avatarUrl?: string): Promise<{ profile: Profile; merged: boolean; linked: boolean }> {
  const repo = getRepo();
  const current = await getCurrentProfile();
  const existing = await repo.findProfileByProvider(provider, providerId);
  if (!existing) {
    if (current.provider && current.providerId !== providerId) {
      // 이미 다른 계정이 연결된 프로필에서 새 계정으로 로그인 → 새 프로필을 만들어 전환
      const fresh = await repo.getOrCreateProfile(crypto.randomUUID());
      const linked = (await repo.linkProvider(fresh.id, { provider, providerId, nickname, avatarUrl })) ?? fresh;
      await setSessionAnonKey(linked.anonKey);
      return { profile: linked, merged: false, linked: true };
    }
    const linked = (await repo.linkProvider(current.id, { provider, providerId, nickname, avatarUrl })) ?? current;
    return { profile: linked, merged: false, linked: true };
  }
  if (existing.id === current.id) return { profile: existing, merged: false, linked: false };
  let merged = false;
  if (!current.provider) {
    await repo.mergeProfiles(current.id, existing.id);
    merged = true;
  }
  await repo.linkProvider(existing.id, { provider, providerId, nickname, avatarUrl });
  await setSessionAnonKey(existing.anonKey);
  return { profile: existing, merged, linked: false };
}
