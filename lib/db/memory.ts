import { randomUUID } from "node:crypto";
import type { Repo } from "./repo";
import type { Badge, LedgerEntry, Profile, Quiz, QuizResponse, QuizSet, RoulettePrize, RouletteSpin, SetCompletion, Stamp, UserBadge } from "@/lib/types";
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
      p = { id: randomUUID(), anonKey, createdAt: now() };
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
};
