import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repo } from "./repo";
import type { Badge, LedgerEntry, Profile, Quiz, QuizResponse, Stamp, UserBadge } from "@/lib/types";

/**
 * Supabase(Postgres) 구현. 서비스 롤 키로 서버에서만 접근한다.
 * 스키마: supabase/migrations/0001_init.sql
 * ※ 아직 실제 프로젝트에 붙여 검증하지 않음. 연결 후 첫 스모크 테스트 필요.
 */

/** supabase 응답 {data, error} 를 풀어 data 를 non-null 로 보장한다. */
function ok<T>(res: { data: T | null; error: unknown }, where: string): T {
  if (res.error) {
    const e = res.error;
    throw new Error(`[supabase:${where}] ${e instanceof Error ? e.message : JSON.stringify(e)}`);
  }
  if (res.data === null || res.data === undefined) throw new Error(`[supabase:${where}] no data`);
  return res.data;
}

type QuizRow = { id: string; question: string; kind: number; active: boolean; sort: number };
type OptionRow = { id: string; quiz_id: string; label: string; emoji: string | null; tags: string[]; sort: number };

export function createSupabaseRepo(url: string, serviceRoleKey: string): Repo {
  const sb: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function loadQuizzes(filter?: { id?: string; activeOnly?: boolean }): Promise<Quiz[]> {
    let qq = sb.from("quizzes").select("id, question, kind, active, sort").order("sort");
    if (filter?.id) qq = qq.eq("id", filter.id);
    if (filter?.activeOnly) qq = qq.eq("active", true);
    const quizzes = ok<QuizRow[]>(await qq, "quizzes");
    const ids = quizzes.map((r) => r.id);
    if (ids.length === 0) return [];
    const options = ok<OptionRow[]>(
      await sb.from("quiz_options").select("id, quiz_id, label, emoji, tags, sort").in("quiz_id", ids).order("sort"),
      "quiz_options",
    );
    const byQuiz = new Map<string, OptionRow[]>();
    for (const o of options) {
      const list = byQuiz.get(o.quiz_id) ?? [];
      list.push(o);
      byQuiz.set(o.quiz_id, list);
    }
    return quizzes.map((r) => ({
      id: r.id,
      question: r.question,
      kind: r.kind as 2 | 4,
      active: r.active,
      sort: r.sort,
      options: (byQuiz.get(r.id) ?? []).map((o) => ({
        id: o.id,
        label: o.label,
        emoji: o.emoji ?? undefined,
        tags: o.tags ?? [],
        sort: o.sort,
      })),
    }));
  }

  return {
    async getOrCreateProfile(anonKey): Promise<Profile> {
      const data = ok<{ id: string; anon_key: string; nickname: string | null; created_at: string }>(
        await sb
          .from("profiles")
          .upsert({ anon_key: anonKey }, { onConflict: "anon_key", ignoreDuplicates: false })
          .select("id, anon_key, nickname, created_at")
          .single(),
        "profiles.upsert",
      );
      return { id: data.id, anonKey: data.anon_key, nickname: data.nickname ?? undefined, createdAt: data.created_at };
    },

    async listActiveQuizzes() {
      return loadQuizzes({ activeOnly: true });
    },

    async getQuiz(quizId) {
      const [q] = await loadQuizzes({ id: quizId });
      return q ?? null;
    },

    async listResponses(userId): Promise<QuizResponse[]> {
      const rows = ok<
        { id: string; user_id: string; quiz_id: string; option_id: string; day_key: string; answered_at: string }[]
      >(
        await sb
          .from("quiz_responses")
          .select("id, user_id, quiz_id, option_id, day_key, answered_at")
          .eq("user_id", userId),
        "quiz_responses.list",
      );
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        quizId: r.quiz_id,
        optionId: r.option_id,
        dayKey: r.day_key,
        answeredAt: r.answered_at,
      }));
    },

    async saveResponse(input): Promise<QuizResponse> {
      const data = ok<{ id: string; answered_at: string }>(
        await sb
          .from("quiz_responses")
          .insert({ user_id: input.userId, quiz_id: input.quizId, option_id: input.optionId, day_key: input.dayKey })
          .select("id, answered_at")
          .single(),
        "quiz_responses.insert",
      );
      return { ...input, id: data.id, answeredAt: data.answered_at };
    },

    async countResponsesByOption(quizId) {
      const rows = ok<{ option_id: string }[]>(
        await sb.from("quiz_responses").select("option_id").eq("quiz_id", quizId),
        "quiz_responses.count",
      );
      const out: Record<string, number> = {};
      for (const r of rows) out[r.option_id] = (out[r.option_id] ?? 0) + 1;
      return out;
    },

    async incrementTagScores(userId, tags) {
      const rows = ok<{ tag: string; score: number }[]>(
        await sb.rpc("increment_tag_scores", { p_user: userId, p_tags: tags }),
        "increment_tag_scores",
      );
      const out: Record<string, number> = {};
      for (const r of rows) out[r.tag] = r.score;
      return out;
    },

    async listBadges(): Promise<Badge[]> {
      const rows = ok<
        { code: string; name: string; description: string | null; emoji: string | null; rule: Badge["rule"] }[]
      >(await sb.from("badges").select("code, name, description, emoji, rule"), "badges");
      return rows.map((b) => ({
        code: b.code,
        name: b.name,
        description: b.description ?? "",
        emoji: b.emoji ?? "🏅",
        rule: b.rule,
      }));
    },

    async listUserBadges(userId): Promise<UserBadge[]> {
      const rows = ok<{ badge_code: string; earned_at: string }[]>(
        await sb.from("user_badges").select("badge_code, earned_at").eq("user_id", userId),
        "user_badges",
      );
      return rows.map((b) => ({ badgeCode: b.badge_code, earnedAt: b.earned_at }));
    },

    async awardBadge(userId, badgeCode) {
      const { error } = await sb
        .from("user_badges")
        .upsert({ user_id: userId, badge_code: badgeCode }, { onConflict: "user_id,badge_code", ignoreDuplicates: true });
      if (error) throw new Error(`[supabase:user_badges.upsert] ${error.message}`);
    },

    async addLedger(entry): Promise<LedgerEntry> {
      const data = ok<{ id: number; created_at: string }>(
        await sb
          .from("point_ledger")
          .insert({
            user_id: entry.userId,
            delta: entry.delta,
            reason: entry.reason,
            ref_type: entry.refType ?? null,
            ref_id: entry.refId ?? null,
            memo: entry.memo ?? null,
          })
          .select("id, created_at")
          .single(),
        "point_ledger.insert",
      );
      return { ...entry, id: String(data.id), createdAt: data.created_at };
    },

    async getBalance(userId) {
      const { data, error } = await sb
        .from("point_balances")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle<{ balance: number }>();
      if (error) throw new Error(`[supabase:point_balances] ${error.message}`);
      return data?.balance ?? 0;
    },

    async addStamp(input): Promise<Stamp> {
      const data = ok<{ id: string; created_at: string }>(
        await sb
          .from("stamps")
          .insert({ user_id: input.userId, source_type: input.sourceType, source_id: input.sourceId ?? null })
          .select("id, created_at")
          .single(),
        "stamps.insert",
      );
      return { ...input, id: data.id, createdAt: data.created_at };
    },

    async countUnconsumedStamps(userId) {
      const { count, error } = await sb
        .from("stamps")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("consumed_by", null);
      if (error) throw new Error(`[supabase:stamps.count] ${error.message}`);
      return count ?? 0;
    },
  };
}
