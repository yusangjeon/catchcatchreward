import { randomUUID } from "node:crypto";
import type { Repo } from "./repo";
import type { Badge, GamePlay, LedgerEntry, Profile, Quiz, QuizResponse, QuizSet, Redemption, Referral, RoulettePrize, RouletteSpin, RushClaim, SetCompletion, Stamp, StoreMission, StoreMissionCompletion, UserBadge } from "@/lib/types";
import { SEED_STORE_MISSIONS } from "@/lib/missions/seed";
import { newInviteCode } from "@/lib/invite/code";
import { SEED_BADGES, SEED_QUIZZES, SEED_SETS } from "@/lib/quiz/seed";
import { SEED_PRIZES } from "@/lib/roulette/seed";

interface Store {
  profiles: Map<string, Profile>;
  sets: QuizSet[];
  quizzes: Quiz[];
  responses: QuizResponse[];
  completions: SetCompletion[];
  tagScores: Map<string, Map<string, number>>;
  badges: Badge[];
  userBadges: Map<string, UserBadge[]>;
  ledger: LedgerEntry[];
  stamps: Stamp[];
  prizes: RoulettePrize[];
  spins: RouletteSpin[];
  redemptions: Redemption[];
  referrals: Referral[];
  storeMissions: StoreMission[];
  storeCompletions: StoreMissionCompletion[];
  rushClaims: RushClaim[];
  gamePlays: GamePlay[];
}

// dev 서버 HMR 때 모듈이 재평가돼도 데이터가 유지되도록 globalThis 에 붙인다.
const g = globalThis as unknown as { __ccrStore?: Store };

function store(): Store {
  if (!g.__ccrStore) {
    g.__ccrStore = {
      profiles: new Map(),
      sets: structuredClone(SEED_SETS),
      quizzes: structuredClone(SEED_QUIZZES),
      responses: [],
      completions: [],
      tagScores: new Map(),
      badges: structuredClone(SEED_BADGES),
      userBadges: new Map(),
      ledger: [],
      stamps: [],
      prizes: structuredClone(SEED_PRIZES),
      spins: [],
      redemptions: [],
      referrals: [],
      storeMissions: structuredClone(SEED_STORE_MISSIONS),
      storeCompletions: [],
      rushClaims: [],
      gamePlays: [],
    };
  }
  return g.__ccrStore;
}

const now = () => new Date().toISOString();

export const memoryRepo: Repo = {
  async getOrCreateProfile(anonKey) {
    const s = store();
    let p = s.profiles.get(anonKey);
    if (!p) {
      p = { id: randomUUID(), anonKey, inviteCode: newInviteCode(), createdAt: now() };
      s.profiles.set(anonKey, p);
    }
    return p;
  },

  async listActiveSets() {
    return store().sets.filter((s) => s.active).sort((a, b) => a.sort - b.sort);
  },
  async getSet(setId) {
    return store().sets.find((s) => s.id === setId) ?? null;
  },
  async listQuizzesBySet(setId) {
    return store().quizzes.filter((q) => q.setId === setId && q.active).sort((a, b) => a.sort - b.sort);
  },

  async listResponses(userId) {
    return store().responses.filter((r) => r.userId === userId);
  },
  async countResponsesByOption(quizIds) {
    const want = new Set(quizIds);
    const out: Record<string, Record<string, number>> = {};
    for (const r of store().responses) {
      if (!want.has(r.quizId)) continue;
      (out[r.quizId] ??= {})[r.optionId] = (out[r.quizId]?.[r.optionId] ?? 0) + 1;
    }
    return out;
  },
  async saveResponse(input) {
    const r: QuizResponse = { ...input, id: randomUUID(), answeredAt: now() };
    store().responses.push(r);
    return r;
  },

  async listCompletions(userId) {
    return store().completions.filter((c) => c.userId === userId);
  },
  async saveCompletion(input) {
    const c: SetCompletion = { ...input, id: randomUUID(), completedAt: now() };
    store().completions.push(c);
    return c;
  },
  async countCompletionsBySet() {
    const out: Record<string, number> = {};
    for (const c of store().completions) out[c.setId] = (out[c.setId] ?? 0) + 1;
    return out;
  },

  async incrementTagScores(userId, tags) {
    const s = store();
    let m = s.tagScores.get(userId);
    if (!m) {
      m = new Map();
      s.tagScores.set(userId, m);
    }
    for (const t of tags) m.set(t, (m.get(t) ?? 0) + 1);
    return Object.fromEntries(m);
  },
  async getTagScores(userId) {
    return Object.fromEntries(store().tagScores.get(userId) ?? new Map());
  },

  async listBadges() {
    return store().badges;
  },
  async listUserBadges(userId) {
    return store().userBadges.get(userId) ?? [];
  },
  async awardBadge(userId, badgeCode) {
    const s = store();
    const list = s.userBadges.get(userId) ?? [];
    if (list.some((b) => b.badgeCode === badgeCode)) return;
    list.push({ badgeCode, earnedAt: now() });
    s.userBadges.set(userId, list);
  },

  async addLedger(entry) {
    const e: LedgerEntry = { ...entry, id: randomUUID(), createdAt: now() };
    store().ledger.push(e);
    return e;
  },
  async getBalance(userId) {
    return store().ledger.filter((e) => e.userId === userId).reduce((sum, e) => sum + e.delta, 0);
  },

  async addStamp(input) {
    const st: Stamp = { ...input, id: randomUUID(), createdAt: now() };
    store().stamps.push(st);
    return st;
  },
  async countUnconsumedStamps(userId) {
    return store().stamps.filter((s) => s.userId === userId && !s.consumedBy).length;
  },
  async hasStamp(userId, sourceType, sourceId) {
    return store().stamps.some((s) => s.userId === userId && s.sourceType === sourceType && s.sourceId === sourceId);
  },
  async consumeStamps(userId, n, spinId) {
    const free = store().stamps.filter((s) => s.userId === userId && !s.consumedBy).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (free.length < n) return 0;
    free.slice(0, n).forEach((s) => (s.consumedBy = spinId));
    return n;
  },

  async listPrizes() {
    return store().prizes.filter((p) => p.active).sort((a, b) => a.sort - b.sort);
  },
  async saveSpin(input) {
    store().spins.push(input);
    return input;
  },
  async listSpins(userId) {
    return store().spins.filter((s) => s.userId === userId).sort((a, b) => b.spunAt.localeCompare(a.spunAt));
  },

  async listStamps(userId) {
    return store().stamps.filter((s) => s.userId === userId);
  },

  async findProfileByInviteCode(code) {
    return [...store().profiles.values()].find((p) => p.inviteCode === code) ?? null;
  },
  async setReferredBy(userId, inviterId) {
    const p = [...store().profiles.values()].find((x) => x.id === userId);
    if (p) p.referredBy = inviterId;
  },
  async addReferral(input) {
    const r: Referral = { ...input, id: randomUUID(), status: "pending", createdAt: now() };
    store().referrals.push(r);
    return r;
  },
  async findReferralByInvitee(inviteeId) {
    return store().referrals.find((r) => r.inviteeId === inviteeId) ?? null;
  },
  async listReferralsByInviter(inviterId) {
    return store().referrals.filter((r) => r.inviterId === inviterId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async markReferralRewarded(id) {
    const r = store().referrals.find((x) => x.id === id);
    if (r) {
      r.status = "rewarded";
      r.rewardedAt = now();
    }
  },

  async listStoreMissions(activeOnly) {
    return store().storeMissions.filter((m) => !activeOnly || m.active).sort((a, b) => a.sort - b.sort);
  },
  async getStoreMission(id) {
    return store().storeMissions.find((m) => m.id === id) ?? null;
  },
  async createStoreMission(m) {
    store().storeMissions.push(m);
    return m;
  },
  async updateStoreMission(id, patch) {
    const m = store().storeMissions.find((x) => x.id === id);
    if (!m) return null;
    Object.assign(m, patch);
    return m;
  },
  async listStoreCompletions(userId) {
    return store().storeCompletions.filter((c) => !userId || c.userId === userId);
  },
  async addStoreCompletion(input) {
    const c: StoreMissionCompletion = { ...input, id: randomUUID(), completedAt: now() };
    store().storeCompletions.push(c);
    return c;
  },
  async countStoreCompletionsByMission() {
    const out: Record<string, number> = {};
    for (const c of store().storeCompletions) out[c.missionId] = (out[c.missionId] ?? 0) + 1;
    return out;
  },

  async addGamePlay(input) {
    const g: GamePlay = { ...input, id: randomUUID(), createdAt: now() };
    store().gamePlays.push(g);
    return g;
  },
  async listGamePlays(userId) {
    return store().gamePlays.filter((g) => g.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listRushClaims(userId, weekKey) {
    return store().rushClaims.filter((c) => c.userId === userId && c.weekKey === weekKey);
  },
  async addRushClaim(input) {
    const c: RushClaim = { ...input, id: randomUUID(), claimedAt: now() };
    store().rushClaims.push(c);
    return c;
  },

  async listLedger(userId, limit = 100) {
    return store().ledger.filter((e) => e.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },

  async addRedemption(input) {
    const r: Redemption = { ...input, id: randomUUID(), status: "requested", requestedAt: now() };
    store().redemptions.push(r);
    return r;
  },
  async listRedemptions(userId) {
    return store().redemptions.filter((r) => !userId || r.userId === userId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },
  async updateRedemption(id, patch) {
    const r = store().redemptions.find((x) => x.id === id);
    if (!r) return null;
    r.status = patch.status;
    if (patch.memo !== undefined) r.memo = patch.memo;
    if (patch.status === "done" || patch.status === "rejected") r.processedAt = now();
    return r;
  },

  async listAllSets() {
    return [...store().sets].sort((a, b) => a.sort - b.sort);
  },
  async createSet(set) {
    store().sets.push(set);
    return set;
  },
  async updateSet(id, patch) {
    const s = store().sets.find((x) => x.id === id);
    if (!s) return null;
    Object.assign(s, patch);
    return s;
  },
  async createQuiz(quiz) {
    store().quizzes.push(quiz);
    return quiz;
  },
  async listAllPrizes() {
    return [...store().prizes].sort((a, b) => a.sort - b.sort);
  },
  async createPrize(p) {
    store().prizes.push(p);
    return p;
  },
  async updatePrize(id, patch) {
    const p = store().prizes.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, patch);
    return p;
  },
  async countUserBadges() {
    const out: Record<string, number> = {};
    for (const list of store().userBadges.values()) for (const b of list) out[b.badgeCode] = (out[b.badgeCode] ?? 0) + 1;
    return out;
  },
  async findProfile(idOrAnonKey) {
    const s = store();
    return s.profiles.get(idOrAnonKey) ?? [...s.profiles.values()].find((p) => p.id === idOrAnonKey) ?? null;
  },
  async listProfiles(limit = 200) {
    return [...store().profiles.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },
  async listAllUserBadges() {
    const out: { userId: string; badgeCode: string }[] = [];
    for (const [userId, list] of store().userBadges) for (const b of list) out.push({ userId, badgeCode: b.badgeCode });
    return out;
  },
  async listAllTagScores() {
    const out: { userId: string; tag: string; score: number }[] = [];
    for (const [userId, m] of store().tagScores) for (const [tag, score] of m) out.push({ userId, tag, score });
    return out;
  },
  async dailyStats(dayKeys) {
    const s = store();
    const key = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);
    return dayKeys.map((dayKey) => ({
      dayKey,
      completions: s.completions.filter((c) => c.dayKey === dayKey).length,
      pointsIssued: s.ledger.filter((e) => e.delta > 0 && key(e.createdAt) === dayKey).reduce((a, e) => a + e.delta, 0),
      newUsers: [...s.profiles.values()].filter((p) => key(p.createdAt) === dayKey).length,
      attendance: s.stamps.filter((st) => st.sourceType === "attendance" && st.sourceId === dayKey).length,
    }));
  },
  async adminStats(dayKey) {
    const s = store();
    return {
      users: s.profiles.size,
      completionsToday: s.completions.filter((c) => c.dayKey === dayKey).length,
      pointsIssued: s.ledger.filter((e) => e.delta > 0).reduce((a, e) => a + e.delta, 0),
      pointsRedeemed: Math.abs(s.ledger.filter((e) => e.delta < 0).reduce((a, e) => a + e.delta, 0)),
      freeStamps: s.stamps.filter((st) => !st.consumedBy).length,
      spins: s.spins.length,
      redemptionsRequested: s.redemptions.filter((r) => r.status === "requested").length,
      storeCompletions: s.storeCompletions.length,
      referrals: s.referrals.length,
      rushClaims: s.rushClaims.length,
    };
  },
};
