import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repo } from "./repo";
import type { Badge, LedgerEntry, Profile, Quiz, QuizResponse, QuizSet, Redemption, Referral, RoulettePrize, SetCompletion, Stamp, StoreMission, UserBadge } from "@/lib/types";
import { newInviteCode } from "@/lib/invite/code";

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
  base_participants: number; today_only: boolean; active: boolean; sort: number; target_badges?: string[] | null;
};
type ProfileRow = { id: string; anon_key: string; nickname: string | null; invite_code: string; referred_by: string | null; created_at: string };
const toProfile = (r: ProfileRow): Profile => ({ id: r.id, anonKey: r.anon_key, nickname: r.nickname ?? undefined, inviteCode: r.invite_code, referredBy: r.referred_by ?? undefined, createdAt: r.created_at });
type StoreRow = { id: string; store_name: string; kind: StoreMission["kind"]; title: string; description: string | null; reward_points: number; code: string; capacity: number; active: boolean; sort: number; created_at: string };
const toStore = (r: StoreRow): StoreMission => ({ id: r.id, storeName: r.store_name, kind: r.kind, title: r.title, description: r.description ?? undefined, rewardPoints: r.reward_points, code: r.code, capacity: r.capacity, active: r.active, sort: r.sort, createdAt: r.created_at });
type RefRow = { id: string; inviter_id: string; invitee_id: string; code: string; status: Referral["status"]; created_at: string; rewarded_at: string | null };
const toRef = (r: RefRow): Referral => ({ id: r.id, inviterId: r.inviter_id, inviteeId: r.invitee_id, code: r.code, status: r.status, createdAt: r.created_at, rewardedAt: r.rewarded_at ?? undefined });
type QuizRow = { id: string; set_id: string; question: string; kind: number; active: boolean; sort: number };
type OptionRow = { id: string; quiz_id: string; label: string; image_url: string | null; tags: string[]; sort: number };

const toSet = (r: SetRow): QuizSet => ({
  id: r.id, title: r.title, imageUrl: r.image_url, rewardPoints: r.reward_points, capacity: r.capacity,
  baseParticipants: r.base_participants, todayOnly: r.today_only, active: r.active, sort: r.sort,
  targetBadges: r.target_badges ?? undefined,
});

export function createSupabaseRepo(url: string, serviceRoleKey: string): Repo {
  const sb: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const SET_COLS = "id, title, image_url, reward_points, capacity, base_participants, today_only, active, sort, target_badges";
  const PROFILE_COLS = "id, anon_key, nickname, invite_code, referred_by, created_at";

  return {
    async getOrCreateProfile(anonKey): Promise<Profile> {
      const { data: found, error } = await sb.from("profiles").select(PROFILE_COLS).eq("anon_key", anonKey).maybeSingle<ProfileRow>();
      if (error) throw new Error(`[supabase:profiles.find] ${error.message}`);
      if (found) return toProfile(found);
      const data = ok<ProfileRow>(
        await sb.from("profiles").upsert({ anon_key: anonKey, invite_code: newInviteCode() }, { onConflict: "anon_key" }).select(PROFILE_COLS).single(),
        "profiles.upsert",
      );
      return toProfile(data);
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

    async listStamps(userId) {
      const rows = ok<{ id: string; user_id: string; source_type: string; source_id: string | null; created_at: string; consumed_by: string | null }[]>(
        await sb.from("stamps").select("*").eq("user_id", userId), "stamps.list",
      );
      return rows.map((r) => ({ id: r.id, userId: r.user_id, sourceType: r.source_type, sourceId: r.source_id ?? undefined, createdAt: r.created_at, consumedBy: r.consumed_by ?? undefined }));
    },

    async findProfileByInviteCode(code) {
      const { data, error } = await sb.from("profiles").select(PROFILE_COLS).eq("invite_code", code).maybeSingle<ProfileRow>();
      if (error) throw new Error(`[supabase:profiles.byCode] ${error.message}`);
      return data ? toProfile(data) : null;
    },
    async setReferredBy(userId, inviterId) {
      const { error } = await sb.from("profiles").update({ referred_by: inviterId }).eq("id", userId);
      if (error) throw new Error(`[supabase:profiles.referredBy] ${error.message}`);
    },
    async addReferral(input) {
      const r = ok<RefRow>(await sb.from("referrals").insert({ inviter_id: input.inviterId, invitee_id: input.inviteeId, code: input.code }).select("*").single(), "referrals.insert");
      return toRef(r);
    },
    async findReferralByInvitee(inviteeId) {
      const { data, error } = await sb.from("referrals").select("*").eq("invitee_id", inviteeId).maybeSingle<RefRow>();
      if (error) throw new Error(`[supabase:referrals.byInvitee] ${error.message}`);
      return data ? toRef(data) : null;
    },
    async listReferralsByInviter(inviterId) {
      return ok<RefRow[]>(await sb.from("referrals").select("*").eq("inviter_id", inviterId).order("created_at", { ascending: false }), "referrals.list").map(toRef);
    },
    async markReferralRewarded(id) {
      const { error } = await sb.from("referrals").update({ status: "rewarded", rewarded_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(`[supabase:referrals.reward] ${error.message}`);
    },

    async listStoreMissions(activeOnly) {
      let q = sb.from("store_missions").select("*").order("sort");
      if (activeOnly) q = q.eq("active", true);
      return ok<StoreRow[]>(await q, "store_missions.list").map(toStore);
    },
    async getStoreMission(id) {
      const { data, error } = await sb.from("store_missions").select("*").eq("id", id).maybeSingle<StoreRow>();
      if (error) throw new Error(`[supabase:store_missions.get] ${error.message}`);
      return data ? toStore(data) : null;
    },
    async createStoreMission(m) {
      ok(await sb.from("store_missions").insert({ id: m.id, store_name: m.storeName, kind: m.kind, title: m.title, description: m.description ?? null, reward_points: m.rewardPoints, code: m.code, capacity: m.capacity, active: m.active, sort: m.sort }).select("id").single(), "store_missions.insert");
      return m;
    },
    async updateStoreMission(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.active !== undefined) row.active = patch.active;
      if (patch.rewardPoints !== undefined) row.reward_points = patch.rewardPoints;
      if (patch.capacity !== undefined) row.capacity = patch.capacity;
      if (patch.code !== undefined) row.code = patch.code;
      if (patch.sort !== undefined) row.sort = patch.sort;
      const { data, error } = await sb.from("store_missions").update(row).eq("id", id).select("*").maybeSingle<StoreRow>();
      if (error) throw new Error(`[supabase:store_missions.update] ${error.message}`);
      return data ? toStore(data) : null;
    },
    async listStoreCompletions(userId) {
      let q = sb.from("store_mission_completions").select("*");
      if (userId) q = q.eq("user_id", userId);
      const rows = ok<{ id: string; user_id: string; mission_id: string; completed_at: string }[]>(await q, "store_mission_completions.list");
      return rows.map((r) => ({ id: r.id, userId: r.user_id, missionId: r.mission_id, completedAt: r.completed_at }));
    },
    async addStoreCompletion(input) {
      const d = ok<{ id: string; completed_at: string }>(await sb.from("store_mission_completions").insert({ user_id: input.userId, mission_id: input.missionId }).select("id, completed_at").single(), "store_mission_completions.insert");
      return { ...input, id: d.id, completedAt: d.completed_at };
    },
    async countStoreCompletionsByMission() {
      const rows = ok<{ mission_id: string }[]>(await sb.from("store_mission_completions").select("mission_id"), "store_mission_completions.count");
      const out: Record<string, number> = {};
      for (const r of rows) out[r.mission_id] = (out[r.mission_id] ?? 0) + 1;
      return out;
    },

    async listRushClaims(userId, weekKey) {
      const rows = ok<{ id: string; user_id: string; week_key: string; mission_key: string; points: number; claimed_at: string }[]>(
        await sb.from("rush_claims").select("*").eq("user_id", userId).eq("week_key", weekKey), "rush_claims.list",
      );
      return rows.map((r) => ({ id: r.id, userId: r.user_id, weekKey: r.week_key, missionKey: r.mission_key, points: r.points, claimedAt: r.claimed_at }));
    },
    async addRushClaim(input) {
      const d = ok<{ id: string; claimed_at: string }>(await sb.from("rush_claims").insert({ user_id: input.userId, week_key: input.weekKey, mission_key: input.missionKey, points: input.points }).select("id, claimed_at").single(), "rush_claims.insert");
      return { ...input, id: d.id, claimedAt: d.claimed_at };
    },

    async listLedger(userId, limit = 100) {
      const rows = ok<{ id: number; user_id: string; delta: number; reason: LedgerEntry["reason"]; ref_type: string | null; ref_id: string | null; memo: string | null; created_at: string }[]>(
        await sb.from("point_ledger").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit),
        "point_ledger.list",
      );
      return rows.map((r) => ({ id: String(r.id), userId: r.user_id, delta: r.delta, reason: r.reason, refType: r.ref_type ?? undefined, refId: r.ref_id ?? undefined, memo: r.memo ?? undefined, createdAt: r.created_at }));
    },

    async addRedemption(input) {
      const r = ok<RedRow>(await sb.from("redemptions").insert({ user_id: input.userId, kind: input.kind, amount_points: input.amountPoints, memo: input.memo ?? null }).select("*").single(), "redemptions.insert");
      return toRed(r);
    },
    async listRedemptions(userId) {
      let q = sb.from("redemptions").select("*").order("requested_at", { ascending: false }).limit(200);
      if (userId) q = q.eq("user_id", userId);
      return ok<RedRow[]>(await q, "redemptions.list").map(toRed);
    },
    async updateRedemption(id, patch) {
      const processed = patch.status === "done" || patch.status === "rejected" ? new Date().toISOString() : null;
      const { data, error } = await sb.from("redemptions").update({ status: patch.status, memo: patch.memo, processed_at: processed }).eq("id", id).select("*").maybeSingle();
      if (error) throw new Error(`[supabase:redemptions.update] ${error.message}`);
      return data ? toRed(data as RedRow) : null;
    },

    async listAllSets() {
      return ok<SetRow[]>(await sb.from("quiz_sets").select("*").order("sort"), "quiz_sets.all").map(toSet);
    },
    async createSet(set) {
      ok(await sb.from("quiz_sets").insert({ id: set.id, title: set.title, image_url: set.imageUrl, reward_points: set.rewardPoints, capacity: set.capacity, base_participants: set.baseParticipants, today_only: set.todayOnly, active: set.active, sort: set.sort, target_badges: set.targetBadges ?? [] }).select("id").single(), "quiz_sets.insert");
      return set;
    },
    async updateSet(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.title !== undefined) row.title = patch.title;
      if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
      if (patch.rewardPoints !== undefined) row.reward_points = patch.rewardPoints;
      if (patch.capacity !== undefined) row.capacity = patch.capacity;
      if (patch.todayOnly !== undefined) row.today_only = patch.todayOnly;
      if (patch.active !== undefined) row.active = patch.active;
      if (patch.sort !== undefined) row.sort = patch.sort;
      if (patch.targetBadges !== undefined) row.target_badges = patch.targetBadges;
      const { data, error } = await sb.from("quiz_sets").update(row).eq("id", id).select("*").maybeSingle();
      if (error) throw new Error(`[supabase:quiz_sets.update] ${error.message}`);
      return data ? toSet(data as SetRow) : null;
    },
    async createQuiz(quiz) {
      ok(await sb.from("quizzes").insert({ id: quiz.id, set_id: quiz.setId, question: quiz.question, kind: quiz.kind, active: quiz.active, sort: quiz.sort }).select("id").single(), "quizzes.insert");
      ok(await sb.from("quiz_options").insert(quiz.options.map((o) => ({ id: o.id, quiz_id: quiz.id, label: o.label, image_url: o.imageUrl ?? null, tags: o.tags, sort: o.sort }))).select("id"), "quiz_options.insert");
      return quiz;
    },
    async listAllPrizes() {
      return ok<RoulettePrize[]>(await sb.from("roulette_prizes").select("*").order("sort"), "roulette_prizes.all");
    },
    async createPrize(p) {
      ok(await sb.from("roulette_prizes").insert(p).select("id").single(), "roulette_prizes.insert");
      return p;
    },
    async updatePrize(id, patch) {
      const { data, error } = await sb.from("roulette_prizes").update(patch).eq("id", id).select("*").maybeSingle();
      if (error) throw new Error(`[supabase:roulette_prizes.update] ${error.message}`);
      return (data as RoulettePrize | null) ?? null;
    },
    async countUserBadges() {
      const rows = ok<{ badge_code: string }[]>(await sb.from("user_badges").select("badge_code"), "user_badges.all");
      const out: Record<string, number> = {};
      for (const r of rows) out[r.badge_code] = (out[r.badge_code] ?? 0) + 1;
      return out;
    },
    async findProfile(idOrAnonKey) {
      const { data } = await sb.from("profiles").select(PROFILE_COLS).or(`id.eq.${idOrAnonKey},anon_key.eq.${idOrAnonKey}`).maybeSingle<ProfileRow>();
      return data ? toProfile(data) : null;
    },
    async adminStats(dayKey) {
      const count = async (q: PromiseLike<{ count: number | null; error: unknown }>) => {
        const { count: c, error } = await q;
        if (error) throw new Error(`[supabase:adminStats] ${JSON.stringify(error)}`);
        return c ?? 0;
      };
      const head = { count: "exact" as const, head: true };
      const ledger = ok<{ delta: number }[]>(await sb.from("point_ledger").select("delta"), "point_ledger.sum");
      return {
        users: await count(sb.from("profiles").select("id", head)),
        completionsToday: await count(sb.from("set_completions").select("id", head).eq("day_key", dayKey)),
        pointsIssued: ledger.filter((e) => e.delta > 0).reduce((a, e) => a + e.delta, 0),
        pointsRedeemed: Math.abs(ledger.filter((e) => e.delta < 0).reduce((a, e) => a + e.delta, 0)),
        freeStamps: await count(sb.from("stamps").select("id", head).is("consumed_by", null)),
        spins: await count(sb.from("roulette_spins").select("id", head)),
        redemptionsRequested: await count(sb.from("redemptions").select("id", head).eq("status", "requested")),
        storeCompletions: await count(sb.from("store_mission_completions").select("id", head)),
        referrals: await count(sb.from("referrals").select("id", head)),
        rushClaims: await count(sb.from("rush_claims").select("id", head)),
      };
    },
  };
}

type RedRow = { id: string; user_id: string; kind: string; amount_points: number; status: Redemption["status"]; requested_at: string; processed_at: string | null; memo: string | null };
const toRed = (r: RedRow): Redemption => ({ id: r.id, userId: r.user_id, kind: r.kind, amountPoints: r.amount_points, status: r.status, requestedAt: r.requested_at, processedAt: r.processed_at ?? undefined, memo: r.memo ?? undefined });
