import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repo } from "./repo";
import type { Badge, LedgerEntry, Profile, Quiz, QuizResponse, QuizSet, RoulettePrize, SetCompletion, Stamp, UserBadge } from "@/lib/types";

/**
 * Supabase(Postgres) 구현. 서비스 롤 키로 서버에서만 접근한다.
 * 스키마: supabase/migrations/0001_init.sql
 * ※ 아직 실제 프로젝트에 붙여 검증하지 않음. 연결 후 첫 스모크 테스트 필요.
 */
function ok<T>(res: { data: T | null; error: unknown }, where: string): T {
  if (res.error) {
    const e = res.error;
    throw new Error(`[supabase:${where}] ${e instanceof Error ? e.message : JSON.stringify(e)}`);
  }
  if (res.data === null || res.data === undefined) throw new Error(`[supabase:${where}] no data`);
  return res.data;
}

type SetRow = {
  id: string; title: string; image_url: string; reward_points: number; capacity: number;
  base_participants: number; today_only: boolean; active: boolean; sort: number;
};
type QuizRow = { id: string; set_id: string; question: string; kind: number; active: boolean; sort: number };
type OptionRow = { id: string; quiz_id: string; label: string; image_url: string | null; tags: string[]; sort: number };

const toSet = (r: SetRow): QuizSet => ({
  id: r.id, title: r.title, imageUrl: r.image_url, rewardPoints: r.reward_points, capacity: r.capacity,
  baseParticipants: r.base_participants, todayOnly: r.today_only, active: r.active, sort: r.sort,
});

export function createSupabaseRepo(url: string, serviceRoleKey: string): Repo {
  const sb: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const SET_COLS = "id, title, image_url, reward_points, capacity, base_participants, today_only, active, sort";

  return {
    async getOrCreateProfile(anonKey): Promise<Profile> {
      const data = ok<{ id: string; anon_key: string; nickname: string | null; created_at: string }>(
        await sb.from("profiles").upsert({ anon_key: anonKey }, { onConflict: "anon_key" }).select("id, anon_key, nickname, created_at").single(),
        "profiles.upsert",
      );
      return { id: data.id, anonKey: data.anon_key, nickname: data.nickname ?? undefined, createdAt: data.created_at };
    },

    async listActiveSets() {
      const rows = ok<SetRow[]>(await sb.from("quiz_sets").select(SET_COLS).eq("active", true).order("sort"), "quiz_sets");
      return rows.map(toSet);
    },
    async getSet(setId) {
      const { data, error } = await sb.from("quiz_sets").select(SET_COLS).eq("id", setId).maybeSingle<SetRow>();
      if (error) throw new Error(`[supabase:quiz_sets.get] ${error.message}`);
      return data ? toSet(data) : null;
    },
    async listQuizzesBySet(setId): Promise<Quiz[]> {
      const quizzes = ok<QuizRow[]>(
        await sb.from("quizzes").select("id, set_id, question, kind, active, sort").eq("set_id", setId).eq("active", true).order("sort"),
        "quizzes",
      );
      if (quizzes.length === 0) return [];
      const options = ok<OptionRow[]>(
        await sb.from("quiz_options").select("id, quiz_id, label, image_url, tags, sort").in("quiz_id", quizzes.map((q) => q.id)).order("sort"),
        "quiz_options",
      );
      return quizzes.map((r) => ({
        id: r.id, setId: r.set_id, question: r.question, kind: r.kind as 2 | 4, active: r.active, sort: r.sort,
        options: options.filter((o) => o.quiz_id === r.id).map((o) => ({
          id: o.id, label: o.label, imageUrl: o.image_url ?? undefined, tags: o.tags ?? [], sort: o.sort,
        })),
      }));
    },

    async listResponses(userId): Promise<QuizResponse[]> {
      const rows = ok<{ id: string; user_id: string; quiz_id: string; option_id: string; day_key: string; answered_at: string }[]>(
        await sb.from("quiz_responses").select("id, user_id, quiz_id, option_id, day_key, answered_at").eq("user_id", userId),
        "quiz_responses.list",
      );
      return rows.map((r) => ({ id: r.id, userId: r.user_id, quizId: r.quiz_id, optionId: r.option_id, dayKey: r.day_key, answeredAt: r.answered_at }));
    },
    async saveResponse(input): Promise<QuizResponse> {
      const data = ok<{ id: string; answered_at: string }>(
        await sb.from("quiz_responses").insert({ user_id: input.userId, quiz_id: input.quizId, option_id: input.optionId, day_key: input.dayKey }).select("id, answered_at").single(),
        "quiz_responses.insert",
      );
      return { ...input, id: data.id, answeredAt: data.answered_at };
    },

    async listCompletions(userId): Promise<SetCompletion[]> {
      const rows = ok<{ id: string; user_id: string; set_id: string; day_key: string; completed_at: string }[]>(
        await sb.from("set_completions").select("id, user_id, set_id, day_key, completed_at").eq("user_id", userId),
        "set_completions.list",
      );
      return rows.map((r) => ({ id: r.id, userId: r.user_id, setId: r.set_id, dayKey: r.day_key, completedAt: r.completed_at }));
    },
    async saveCompletion(input): Promise<SetCompletion> {
      const data = ok<{ id: string; completed_at: string }>(
        await sb.from("set_completions").insert({ user_id: input.userId, set_id: input.setId, day_key: input.dayKey }).select("id, completed_at").single(),
        "set_completions.insert",
      );
      return { ...input, id: data.id, completedAt: data.completed_at };
    },
    async countCompletionsBySet() {
      const rows = ok<{ set_id: string; cnt: number }[]>(await sb.rpc("count_set_completions"), "count_set_completions");
      const out: Record<string, number> = {};
      for (const r of rows) out[r.set_id] = Number(r.cnt);
      return out;
    },

    async incrementTagScores(userId, tags) {
      const rows = ok<{ tag: string; score: number }[]>(await sb.rpc("increment_tag_scores", { p_user: userId, p_tags: tags }), "increment_tag_scores");
      return Object.fromEntries(rows.map((r) => [r.tag, r.score]));
    },
    async getTagScores(userId) {
      const rows = ok<{ tag: string; score: number }[]>(await sb.from("user_tag_scores").select("tag, score").eq("user_id", userId), "user_tag_scores");
      return Object.fromEntries(rows.map((r) => [r.tag, r.score]));
    },

    async listBadges(): Promise<Badge[]> {
      const rows = ok<{ code: string; name: string; description: string | null; emoji: string | null; rule: Badge["rule"] }[]>(
        await sb.from("badges").select("code, name, description, emoji, rule"), "badges",
      );
      return rows.map((b) => ({ code: b.code, name: b.name, description: b.description ?? "", emoji: b.emoji ?? "🏅", rule: b.rule }));
    },
    async listUserBadges(userId): Promise<UserBadge[]> {
      const rows = ok<{ badge_code: string; earned_at: string }[]>(await sb.from("user_badges").select("badge_code, earned_at").eq("user_id", userId), "user_badges");
      return rows.map((b) => ({ badgeCode: b.badge_code, earnedAt: b.earned_at }));
    },
    async awardBadge(userId, badgeCode) {
      const { error } = await sb.from("user_badges").upsert({ user_id: userId, badge_code: badgeCode }, { onConflict: "user_id,badge_code", ignoreDuplicates: true });
      if (error) throw new Error(`[supabase:user_badges.upsert] ${error.message}`);
    },

    async addLedger(entry): Promise<LedgerEntry> {
      const data = ok<{ id: number; created_at: string }>(
        await sb.from("point_ledger").insert({
          user_id: entry.userId, delta: entry.delta, reason: entry.reason,
          ref_type: entry.refType ?? null, ref_id: entry.refId ?? null, memo: entry.memo ?? null,
        }).select("id, created_at").single(),
        "point_ledger.insert",
      );
      return { ...entry, id: String(data.id), createdAt: data.created_at };
    },
    async getBalance(userId) {
      const { data, error } = await sb.from("point_balances").select("balance").eq("user_id", userId).maybeSingle<{ balance: number }>();
      if (error) throw new Error(`[supabase:point_balances] ${error.message}`);
      return data?.balance ?? 0;
    },

    async addStamp(input): Promise<Stamp> {
      const data = ok<{ id: string; created_at: string }>(
        await sb.from("stamps").insert({ user_id: input.userId, source_type: input.sourceType, source_id: input.sourceId ?? null }).select("id, created_at").single(),
        "stamps.insert",
      );
      return { ...input, id: data.id, createdAt: data.created_at };
    },
    async countUnconsumedStamps(userId) {
      const { count, error } = await sb.from("stamps").select("id", { count: "exact", head: true }).eq("user_id", userId).is("consumed_by", null);
      if (error) throw new Error(`[supabase:stamps.count] ${error.message}`);
      return count ?? 0;
    },
    async hasStamp(userId, sourceType, sourceId) {
      const { count, error } = await sb.from("stamps").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("source_type", sourceType).eq("source_id", sourceId);
      if (error) throw new Error(`[supabase:stamps.has] ${error.message}`);
      return (count ?? 0) > 0;
    },
    async consumeStamps(userId, n, spinId) {
      // 오래된 미사용 스탬프 n개를 고른 뒤 consumed_by 세팅. 동시 요청 경합은 스핀 1건당 10개 고정이라 재검증으로 방어.
      const rows = ok<{ id: string }[]>(
        await sb.from("stamps").select("id").eq("user_id", userId).is("consumed_by", null).order("created_at", { ascending: true }).limit(n),
        "stamps.pick",
      );
      if (rows.length < n) return 0;
      const ids = rows.map((r) => r.id);
      const { error, count } = await sb.from("stamps").update({ consumed_by: spinId }, { count: "exact" }).in("id", ids).is("consumed_by", null);
      if (error) throw new Error(`[supabase:stamps.consume] ${error.message}`);
      return count ?? 0;
    },

    async listPrizes() {
      const rows = ok<{ id: string; name: string; kind: RoulettePrize["kind"]; value: number; weight: number; active: boolean; sort: number }[]>(
        await sb.from("roulette_prizes").select("*").eq("active", true).order("sort"),
        "roulette_prizes.list",
      );
      return rows;
    },
    async saveSpin(input) {
      ok(await sb.from("roulette_spins").insert({ id: input.id, user_id: input.userId, prize_id: input.prizeId, roll: input.roll, spun_at: input.spunAt }).select("id").single(), "roulette_spins.insert");
      return input;
    },
    async listSpins(userId) {
      const rows = ok<{ id: string; user_id: string; prize_id: string; roll: number; spun_at: string }[]>(
        await sb.from("roulette_spins").select("*").eq("user_id", userId).order("spun_at", { ascending: false }).limit(50),
        "roulette_spins.list",
      );
      return rows.map((r) => ({ id: r.id, userId: r.user_id, prizeId: r.prize_id, roll: r.roll, spunAt: r.spun_at }));
    },
  };
}
