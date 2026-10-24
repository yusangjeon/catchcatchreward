import { randomUUID } from "node:crypto";
import type { Repo } from "./repo";
import type { Badge, LedgerEntry, Profile, Quiz, QuizResponse, Stamp, UserBadge } from "@/lib/types";
import { SEED_BADGES, SEED_QUIZZES } from "@/lib/quiz/seed";

interface Store {
  profiles: Map<string, Profile>; // key: anonKey
  quizzes: Quiz[];
  responses: QuizResponse[];
  tagScores: Map<string, Map<string, number>>; // userId -> tag -> score
  badges: Badge[];
  userBadges: Map<string, UserBadge[]>;
  ledger: LedgerEntry[];
  stamps: Stamp[];
}

// dev 서버 HMR 때 모듈이 재평가돼도 데이터가 유지되도록 globalThis 에 붙인다.
const g = globalThis as unknown as { __ccrStore?: Store };

function store(): Store {
  if (!g.__ccrStore) {
    g.__ccrStore = {
      profiles: new Map(),
      quizzes: structuredClone(SEED_QUIZZES),
      responses: [],
      tagScores: new Map(),
      badges: structuredClone(SEED_BADGES),
      userBadges: new Map(),
      ledger: [],
      stamps: [],
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

  async listActiveQuizzes() {
    return store()
      .quizzes.filter((q) => q.active)
      .sort((a, b) => a.sort - b.sort);
  },

  async getQuiz(quizId) {
    return store().quizzes.find((q) => q.id === quizId) ?? null;
  },

  async listResponses(userId) {
    return store().responses.filter((r) => r.userId === userId);
  },

  async saveResponse(input) {
    const r: QuizResponse = { ...input, id: randomUUID(), answeredAt: now() };
    store().responses.push(r);
    return r;
  },

  async countResponsesByOption(quizId) {
    const out: Record<string, number> = {};
    for (const r of store().responses) {
      if (r.quizId !== quizId) continue;
      out[r.optionId] = (out[r.optionId] ?? 0) + 1;
    }
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
    return store()
      .ledger.filter((e) => e.userId === userId)
      .reduce((sum, e) => sum + e.delta, 0);
  },

  async addStamp(input) {
    const st: Stamp = { ...input, id: randomUUID(), createdAt: now() };
    store().stamps.push(st);
    return st;
  },

  async countUnconsumedStamps(userId) {
    return store().stamps.filter((s) => s.userId === userId && !s.consumedBy).length;
  },
};
