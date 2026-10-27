import postgres, { type Sql } from "postgres";
import type { Repo } from "./repo";
import type { Badge, GamePlay, LedgerEntry, Profile, QuizResponse, QuizSet, Redemption, Referral, RoulettePrize, RouletteSpin, RushClaim, SetCompletion, Stamp, StoreMission, StoreMissionCompletion, UserBadge } from "@/lib/types";
import { newInviteCode } from "@/lib/invite/code";

/**
 * Postgres 구현(Supabase 포함 — 연결 문자열만 있으면 됨). 서버 전용.
 * 스키마: lib/db/schema.ts. Supabase 는 Transaction pooler(6543) 를 쓰므로 prepare:false.
 */
const iso = (d: Date | string | null | undefined) => (d instanceof Date ? d.toISOString() : d ?? undefined);
const isoReq = (d: Date | string) => (d instanceof Date ? d.toISOString() : d);

let client: Sql | undefined;
export function pgClient(url: string): Sql {
  if (!client) client = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
  return client;
}

type ProfileRow = { id: string; anon_key: string; nickname: string | null; invite_code: string; referred_by: string | null; provider: string | null; provider_id: string | null; avatar_url: string | null; created_at: Date };
const toProfile = (r: ProfileRow): Profile => ({ id: r.id, anonKey: r.anon_key, nickname: r.nickname ?? undefined, inviteCode: r.invite_code, referredBy: r.referred_by ?? undefined, provider: (r.provider as Profile["provider"]) ?? undefined, providerId: r.provider_id ?? undefined, avatarUrl: r.avatar_url ?? undefined, createdAt: isoReq(r.created_at) });
type SetRow = { id: string; title: string; image_url: string; reward_points: number; capacity: number; base_participants: number; today_only: boolean; active: boolean; sort: number; target_badges: string[] };
const toSet = (r: SetRow): QuizSet => ({ id: r.id, title: r.title, imageUrl: r.image_url, rewardPoints: r.reward_points, capacity: r.capacity, baseParticipants: r.base_participants, todayOnly: r.today_only, active: r.active, sort: r.sort, targetBadges: r.target_badges?.length ? r.target_badges : undefined });
type StampRow = { id: string; user_id: string; source_type: string; source_id: string | null; created_at: Date; consumed_by: string | null };
const toStamp = (r: StampRow): Stamp => ({ id: r.id, userId: r.user_id, sourceType: r.source_type, sourceId: r.source_id ?? undefined, createdAt: isoReq(r.created_at), consumedBy: r.consumed_by ?? undefined });
type LedgerRow = { id: number; user_id: string; delta: number; reason: LedgerEntry["reason"]; ref_type: string | null; ref_id: string | null; memo: string | null; created_at: Date };
const toLedger = (r: LedgerRow): LedgerEntry => ({ id: String(r.id), userId: r.user_id, delta: r.delta, reason: r.reason, refType: r.ref_type ?? undefined, refId: r.ref_id ?? undefined, memo: r.memo ?? undefined, createdAt: isoReq(r.created_at) });
type RedRow = { id: string; user_id: string; kind: string; amount_points: number; status: Redemption["status"]; requested_at: Date; processed_at: Date | null; memo: string | null };
const toRed = (r: RedRow): Redemption => ({ id: r.id, userId: r.user_id, kind: r.kind, amountPoints: r.amount_points, status: r.status, requestedAt: isoReq(r.requested_at), processedAt: iso(r.processed_at), memo: r.memo ?? undefined });
type RefRow = { id: string; inviter_id: string; invitee_id: string; code: string; status: Referral["status"]; created_at: Date; rewarded_at: Date | null };
const toRef = (r: RefRow): Referral => ({ id: r.id, inviterId: r.inviter_id, inviteeId: r.invitee_id, code: r.code, status: r.status, createdAt: isoReq(r.created_at), rewardedAt: iso(r.rewarded_at) });
type StoreRow = { id: string; store_name: string; kind: StoreMission["kind"]; title: string; description: string | null; reward_points: number; code: string; capacity: number; active: boolean; sort: number; created_at: Date };
const toStore = (r: StoreRow): StoreMission => ({ id: r.id, storeName: r.store_name, kind: r.kind, title: r.title, description: r.description ?? undefined, rewardPoints: r.reward_points, code: r.code, capacity: r.capacity, active: r.active, sort: r.sort, createdAt: isoReq(r.created_at) });
type ScRow = { id: string; user_id: string; mission_id: string; completed_at: Date };
const toSc = (r: ScRow): StoreMissionCompletion => ({ id: r.id, userId: r.user_id, missionId: r.mission_id, completedAt: isoReq(r.completed_at) });
type ClaimRow = { id: string; user_id: string; week_key: string; mission_key: string; points: number; claimed_at: Date };
const toClaim = (r: ClaimRow): RushClaim => ({ id: r.id, userId: r.user_id, weekKey: r.week_key, missionKey: r.mission_key, points: r.points, claimedAt: isoReq(r.claimed_at) });
type SpinRow = { id: string; user_id: string; prize_id: string; roll: number; spun_at: Date };
const toSpin = (r: SpinRow): RouletteSpin => ({ id: r.id, userId: r.user_id, prizeId: r.prize_id, roll: r.roll, spunAt: isoReq(r.spun_at) });

export function createPostgresRepo(url: string): Repo {
  const sql = pgClient(url);
  const count = async (q: Promise<{ n: number | string }[]>) => Number((await q)[0]?.n ?? 0);

  return {
    async getOrCreateProfile(anonKey) {
      const found = await sql<ProfileRow[]>`select * from profiles where anon_key = ${anonKey}`;
      if (found[0]) return toProfile(found[0]);
      const rows = await sql<ProfileRow[]>`insert into profiles (anon_key, invite_code) values (${anonKey}, ${newInviteCode()}) on conflict (anon_key) do update set anon_key = excluded.anon_key returning *`;
      return toProfile(rows[0]);
    },

    async listActiveSets() {
      return (await sql<SetRow[]>`select * from quiz_sets where active order by sort`).map(toSet);
    },
    async getSet(setId) {
      const r = await sql<SetRow[]>`select * from quiz_sets where id = ${setId}`;
      return r[0] ? toSet(r[0]) : null;
    },
    async listQuizzesBySet(setId) {
      const qs = await sql<{ id: string; set_id: string; question: string; kind: number; active: boolean; sort: number }[]>`select * from quizzes where set_id = ${setId} and active order by sort`;
      if (qs.length === 0) return [];
      const os = await sql<{ id: string; quiz_id: string; label: string; image_url: string | null; tags: string[]; sort: number }[]>`select * from quiz_options where quiz_id in ${sql(qs.map((q) => q.id))} order by sort`;
      return qs.map((q) => ({
        id: q.id, setId: q.set_id, question: q.question, kind: q.kind as 2 | 4, active: q.active, sort: q.sort,
        options: os.filter((o) => o.quiz_id === q.id).map((o) => ({ id: o.id, label: o.label, imageUrl: o.image_url ?? undefined, tags: o.tags ?? [], sort: o.sort })),
      }));
    },

    async listResponses(userId) {
      const rows = await sql<{ id: string; user_id: string; quiz_id: string; option_id: string; day_key: string; answered_at: Date }[]>`select * from quiz_responses where user_id = ${userId}`;
      return rows.map((r): QuizResponse => ({ id: r.id, userId: r.user_id, quizId: r.quiz_id, optionId: r.option_id, dayKey: r.day_key, answeredAt: isoReq(r.answered_at) }));
    },
    async countResponsesByOption(quizIds) {
      if (quizIds.length === 0) return {};
      const rows = await sql<{ quiz_id: string; option_id: string; n: string }[]>`select quiz_id, option_id, count(*)::int as n from quiz_responses where quiz_id in ${sql(quizIds)} group by quiz_id, option_id`;
      const out: Record<string, Record<string, number>> = {};
      for (const r of rows) (out[r.quiz_id] ??= {})[r.option_id] = Number(r.n);
      return out;
    },
    async saveResponse(input) {
      const rows = await sql<{ id: string; answered_at: Date }[]>`insert into quiz_responses (user_id, quiz_id, option_id, day_key) values (${input.userId}, ${input.quizId}, ${input.optionId}, ${input.dayKey}) on conflict (user_id, quiz_id) do update set option_id = excluded.option_id returning id, answered_at`;
      return { ...input, id: rows[0].id, answeredAt: isoReq(rows[0].answered_at) };
    },

    async listCompletions(userId) {
      const rows = await sql<{ id: string; user_id: string; set_id: string; day_key: string; completed_at: Date }[]>`select * from set_completions where user_id = ${userId}`;
      return rows.map((r): SetCompletion => ({ id: r.id, userId: r.user_id, setId: r.set_id, dayKey: r.day_key, completedAt: isoReq(r.completed_at) }));
    },
    async saveCompletion(input) {
      const rows = await sql<{ id: string; completed_at: Date }[]>`insert into set_completions (user_id, set_id, day_key) values (${input.userId}, ${input.setId}, ${input.dayKey}) returning id, completed_at`;
      return { ...input, id: rows[0].id, completedAt: isoReq(rows[0].completed_at) };
    },
    async countCompletionsBySet() {
      const rows = await sql<{ set_id: string; n: string }[]>`select set_id, count(*)::int as n from set_completions group by set_id`;
      return Object.fromEntries(rows.map((r) => [r.set_id, Number(r.n)]));
    },

    async incrementTagScores(userId, tags) {
      if (tags.length > 0) {
        // 같은 태그가 한 번에 여러 개 올 수 있으므로(예: saving ×2) 먼저 묶어서 증가분을 계산
        await sql`insert into user_tag_scores (user_id, tag, score, updated_at) select ${userId}, t, count(*)::int, now() from unnest(${sql.array(tags)}::text[]) as t group by t on conflict (user_id, tag) do update set score = user_tag_scores.score + excluded.score, updated_at = now()`;
      }
      return this.getTagScores(userId);
    },
    async getTagScores(userId) {
      const rows = await sql<{ tag: string; score: number }[]>`select tag, score from user_tag_scores where user_id = ${userId}`;
      return Object.fromEntries(rows.map((r) => [r.tag, r.score]));
    },

    async listBadges() {
      const rows = await sql<{ code: string; name: string; description: string | null; emoji: string | null; rule: Badge["rule"] }[]>`select * from badges order by code`;
      return rows.map((b) => ({ code: b.code, name: b.name, description: b.description ?? "", emoji: b.emoji ?? "🏅", rule: b.rule }));
    },
    async listUserBadges(userId) {
      const rows = await sql<{ badge_code: string; earned_at: Date }[]>`select badge_code, earned_at from user_badges where user_id = ${userId}`;
      return rows.map((b): UserBadge => ({ badgeCode: b.badge_code, earnedAt: isoReq(b.earned_at) }));
    },
    async awardBadge(userId, badgeCode) {
      await sql`insert into user_badges (user_id, badge_code) values (${userId}, ${badgeCode}) on conflict do nothing`;
    },

    async addLedger(entry) {
      const rows = await sql<{ id: number; created_at: Date }[]>`insert into point_ledger (user_id, delta, reason, ref_type, ref_id, memo) values (${entry.userId}, ${entry.delta}, ${entry.reason}, ${entry.refType ?? null}, ${entry.refId ?? null}, ${entry.memo ?? null}) returning id, created_at`;
      return { ...entry, id: String(rows[0].id), createdAt: isoReq(rows[0].created_at) };
    },
    async getBalance(userId) {
      return count(sql`select coalesce(sum(delta), 0)::int as n from point_ledger where user_id = ${userId}`);
    },

    async addStamp(input) {
      const rows = await sql<{ id: string; created_at: Date }[]>`insert into stamps (user_id, source_type, source_id) values (${input.userId}, ${input.sourceType}, ${input.sourceId ?? null}) returning id, created_at`;
      return { ...input, id: rows[0].id, createdAt: isoReq(rows[0].created_at) };
    },
    async countUnconsumedStamps(userId) {
      return count(sql`select count(*)::int as n from stamps where user_id = ${userId} and consumed_by is null`);
    },
    async hasStamp(userId, sourceType, sourceId) {
      return (await count(sql`select count(*)::int as n from stamps where user_id = ${userId} and source_type = ${sourceType} and source_id = ${sourceId}`)) > 0;
    },
    async consumeStamps(userId, n, spinId) {
      const rows = await sql<{ id: string }[]>`update stamps set consumed_by = ${spinId} where id in (select id from stamps where user_id = ${userId} and consumed_by is null order by created_at limit ${n} for update skip locked) returning id`;
      if (rows.length < n) {
        if (rows.length > 0) await sql`update stamps set consumed_by = null where consumed_by = ${spinId}`;
        return 0;
      }
      return rows.length;
    },
    async listStamps(userId) {
      return (await sql<StampRow[]>`select * from stamps where user_id = ${userId}`).map(toStamp);
    },

    async listPrizes() {
      return (await sql<RoulettePrize[]>`select * from roulette_prizes where active order by sort`).map((p) => ({ ...p }));
    },
    async saveSpin(input) {
      await sql`insert into roulette_spins (id, user_id, prize_id, roll, spun_at) values (${input.id}, ${input.userId}, ${input.prizeId}, ${input.roll}, ${input.spunAt})`;
      return input;
    },
    async listSpins(userId) {
      return (await sql<SpinRow[]>`select * from roulette_spins where user_id = ${userId} order by spun_at desc limit 100`).map(toSpin);
    },

    async findProfileByProvider(provider, providerId) {
      const r = await sql<ProfileRow[]>`select * from profiles where provider = ${provider} and provider_id = ${providerId}`;
      return r[0] ? toProfile(r[0]) : null;
    },
    async linkProvider(userId, link) {
      const r = await sql<ProfileRow[]>`update profiles set provider = ${link.provider ?? null}, provider_id = ${link.providerId}, nickname = coalesce(${link.nickname ?? null}, nickname), avatar_url = coalesce(${link.avatarUrl ?? null}, avatar_url) where id = ${userId} returning *`;
      return r[0] ? toProfile(r[0]) : null;
    },
    async mergeProfiles(fromId, toId) {
      if (fromId === toId) return;
      await sql.begin(async (tx) => {
        await tx`update point_ledger set user_id = ${toId} where user_id = ${fromId}`;
        await tx`update stamps set user_id = ${toId} where user_id = ${fromId}`;
        await tx`update roulette_spins set user_id = ${toId} where user_id = ${fromId}`;
        await tx`update redemptions set user_id = ${toId} where user_id = ${fromId}`;
        await tx`update game_plays set user_id = ${toId} where user_id = ${fromId}`;
        await tx`delete from set_completions f where f.user_id = ${fromId} and exists (select 1 from set_completions t where t.user_id = ${toId} and t.set_id = f.set_id)`;
        await tx`update set_completions set user_id = ${toId} where user_id = ${fromId}`;
        await tx`delete from quiz_responses f where f.user_id = ${fromId} and exists (select 1 from quiz_responses t where t.user_id = ${toId} and t.quiz_id = f.quiz_id)`;
        await tx`update quiz_responses set user_id = ${toId} where user_id = ${fromId}`;
        await tx`delete from store_mission_completions f where f.user_id = ${fromId} and exists (select 1 from store_mission_completions t where t.user_id = ${toId} and t.mission_id = f.mission_id)`;
        await tx`update store_mission_completions set user_id = ${toId} where user_id = ${fromId}`;
        await tx`delete from rush_claims f where f.user_id = ${fromId} and exists (select 1 from rush_claims t where t.user_id = ${toId} and t.week_key = f.week_key and t.mission_key = f.mission_key)`;
        await tx`update rush_claims set user_id = ${toId} where user_id = ${fromId}`;
        await tx`update referrals set inviter_id = ${toId} where inviter_id = ${fromId}`;
        await tx`delete from referrals where invitee_id = ${fromId} and exists (select 1 from referrals t where t.invitee_id = ${toId})`;
        await tx`update referrals set invitee_id = ${toId} where invitee_id = ${fromId}`;
        await tx`insert into user_tag_scores (user_id, tag, score, updated_at) select ${toId}, tag, score, now() from user_tag_scores where user_id = ${fromId} on conflict (user_id, tag) do update set score = user_tag_scores.score + excluded.score, updated_at = now()`;
        await tx`delete from user_tag_scores where user_id = ${fromId}`;
        await tx`insert into user_badges (user_id, badge_code, earned_at) select ${toId}, badge_code, earned_at from user_badges where user_id = ${fromId} on conflict do nothing`;
        await tx`delete from user_badges where user_id = ${fromId}`;
        await tx`update profiles set referred_by = ${toId} where referred_by = ${fromId}`;
        await tx`delete from profiles where id = ${fromId}`;
      });
    },
    async findProfileByInviteCode(code) {
      const r = await sql<ProfileRow[]>`select * from profiles where invite_code = ${code}`;
      return r[0] ? toProfile(r[0]) : null;
    },
    async setReferredBy(userId, inviterId) {
      await sql`update profiles set referred_by = ${inviterId} where id = ${userId}`;
    },
    async addReferral(input) {
      const r = await sql<RefRow[]>`insert into referrals (inviter_id, invitee_id, code) values (${input.inviterId}, ${input.inviteeId}, ${input.code}) returning *`;
      return toRef(r[0]);
    },
    async findReferralByInvitee(inviteeId) {
      const r = await sql<RefRow[]>`select * from referrals where invitee_id = ${inviteeId}`;
      return r[0] ? toRef(r[0]) : null;
    },
    async listReferralsByInviter(inviterId) {
      return (await sql<RefRow[]>`select * from referrals where inviter_id = ${inviterId} order by created_at desc`).map(toRef);
    },
    async markReferralRewarded(id) {
      await sql`update referrals set status = 'rewarded', rewarded_at = now() where id = ${id}`;
    },

    async listStoreMissions(activeOnly) {
      const rows = activeOnly ? await sql<StoreRow[]>`select * from store_missions where active order by sort` : await sql<StoreRow[]>`select * from store_missions order by sort`;
      return rows.map(toStore);
    },
    async getStoreMission(id) {
      const r = await sql<StoreRow[]>`select * from store_missions where id = ${id}`;
      return r[0] ? toStore(r[0]) : null;
    },
    async createStoreMission(m) {
      await sql`insert into store_missions (id, store_name, kind, title, description, reward_points, code, capacity, active, sort, created_at) values (${m.id}, ${m.storeName}, ${m.kind}, ${m.title}, ${m.description ?? null}, ${m.rewardPoints}, ${m.code}, ${m.capacity}, ${m.active}, ${m.sort}, ${m.createdAt})`;
      return m;
    },
    async updateStoreMission(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.active !== undefined) row.active = patch.active;
      if (patch.rewardPoints !== undefined) row.reward_points = patch.rewardPoints;
      if (patch.capacity !== undefined) row.capacity = patch.capacity;
      if (patch.code !== undefined) row.code = patch.code;
      if (patch.sort !== undefined) row.sort = patch.sort;
      if (Object.keys(row).length === 0) return this.getStoreMission(id);
      const r = await sql<StoreRow[]>`update store_missions set ${sql(row)} where id = ${id} returning *`;
      return r[0] ? toStore(r[0]) : null;
    },
    async listStoreCompletions(userId) {
      const rows = userId ? await sql<ScRow[]>`select * from store_mission_completions where user_id = ${userId}` : await sql<ScRow[]>`select * from store_mission_completions`;
      return rows.map(toSc);
    },
    async addStoreCompletion(input) {
      const r = await sql<ScRow[]>`insert into store_mission_completions (user_id, mission_id) values (${input.userId}, ${input.missionId}) returning *`;
      return toSc(r[0]);
    },
    async countStoreCompletionsByMission() {
      const rows = await sql<{ mission_id: string; n: string }[]>`select mission_id, count(*)::int as n from store_mission_completions group by mission_id`;
      return Object.fromEntries(rows.map((r) => [r.mission_id, Number(r.n)]));
    },

    async countHoneyTopups(userId, dayKey) {
      return count(sql`select count(*)::int as n from honey_topups where user_id = ${userId} and day_key = ${dayKey}`);
    },
    async addHoneyTopup(userId, dayKey) {
      await sql`insert into honey_topups (user_id, day_key) values (${userId}, ${dayKey})`;
    },
    async addGamePlay(input) {
      const r = await sql<{ id: string; created_at: Date }[]>`insert into game_plays (user_id, game, day_key, result, points) values (${input.userId}, ${input.game}, ${input.dayKey}, ${input.result}, ${input.points}) returning id, created_at`;
      return { ...input, id: r[0].id, createdAt: isoReq(r[0].created_at) };
    },
    async listGamePlays(userId) {
      const rows = await sql<{ id: string; user_id: string; game: GamePlay["game"]; day_key: string; result: string; points: number; created_at: Date }[]>`select * from game_plays where user_id = ${userId} order by created_at desc limit 500`;
      return rows.map((r) => ({ id: r.id, userId: r.user_id, game: r.game, dayKey: r.day_key, result: r.result, points: r.points, createdAt: isoReq(r.created_at) }));
    },

    async listRushClaims(userId, weekKey) {
      return (await sql<ClaimRow[]>`select * from rush_claims where user_id = ${userId} and week_key = ${weekKey}`).map(toClaim);
    },
    async addRushClaim(input) {
      const r = await sql<ClaimRow[]>`insert into rush_claims (user_id, week_key, mission_key, points) values (${input.userId}, ${input.weekKey}, ${input.missionKey}, ${input.points}) returning *`;
      return toClaim(r[0]);
    },

    async listLedger(userId, limit = 100) {
      return (await sql<LedgerRow[]>`select * from point_ledger where user_id = ${userId} order by created_at desc, id desc limit ${limit}`).map(toLedger);
    },

    async addRedemption(input) {
      const r = await sql<RedRow[]>`insert into redemptions (user_id, kind, amount_points, memo) values (${input.userId}, ${input.kind}, ${input.amountPoints}, ${input.memo ?? null}) returning *`;
      return toRed(r[0]);
    },
    async listRedemptions(userId) {
      const rows = userId ? await sql<RedRow[]>`select * from redemptions where user_id = ${userId} order by requested_at desc limit 200` : await sql<RedRow[]>`select * from redemptions order by requested_at desc limit 200`;
      return rows.map(toRed);
    },
    async updateRedemption(id, patch) {
      const processed = patch.status === "done" || patch.status === "rejected" ? new Date() : null;
      const r = patch.memo !== undefined
        ? await sql<RedRow[]>`update redemptions set status = ${patch.status}, memo = ${patch.memo}, processed_at = ${processed} where id = ${id} returning *`
        : await sql<RedRow[]>`update redemptions set status = ${patch.status}, processed_at = ${processed} where id = ${id} returning *`;
      return r[0] ? toRed(r[0]) : null;
    },

    async listAllSets() {
      return (await sql<SetRow[]>`select * from quiz_sets order by sort`).map(toSet);
    },
    async createSet(set) {
      await sql`insert into quiz_sets (id, title, image_url, reward_points, capacity, base_participants, today_only, active, sort, target_badges) values (${set.id}, ${set.title}, ${set.imageUrl}, ${set.rewardPoints}, ${set.capacity}, ${set.baseParticipants}, ${set.todayOnly}, ${set.active}, ${set.sort}, ${sql.array(set.targetBadges ?? [])}::text[]) on conflict (id) do nothing`;
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
      if (patch.targetBadges !== undefined) row.target_badges = sql.array(patch.targetBadges);
      if (Object.keys(row).length === 0) return this.getSet(id);
      const r = await sql<SetRow[]>`update quiz_sets set ${sql(row)} where id = ${id} returning *`;
      return r[0] ? toSet(r[0]) : null;
    },
    async createQuiz(quiz) {
      await sql.begin(async (tx) => {
        await tx`insert into quizzes (id, set_id, question, kind, active, sort) values (${quiz.id}, ${quiz.setId}, ${quiz.question}, ${quiz.kind}, ${quiz.active}, ${quiz.sort}) on conflict (id) do nothing`;
        for (const o of quiz.options) {
          await tx`insert into quiz_options (id, quiz_id, label, image_url, tags, sort) values (${o.id}, ${quiz.id}, ${o.label}, ${o.imageUrl ?? null}, ${tx.array(o.tags)}::text[], ${o.sort}) on conflict (id) do nothing`;
        }
      });
      return quiz;
    },
    async listAllPrizes() {
      return (await sql<RoulettePrize[]>`select * from roulette_prizes order by sort`).map((p) => ({ ...p }));
    },
    async createPrize(p) {
      await sql`insert into roulette_prizes (id, name, kind, value, weight, active, sort) values (${p.id}, ${p.name}, ${p.kind}, ${p.value}, ${p.weight}, ${p.active}, ${p.sort}) on conflict (id) do nothing`;
      return p;
    },
    async updatePrize(id, patch) {
      const row: Record<string, unknown> = {};
      for (const k of ["name", "kind", "value", "weight", "active", "sort"] as const) if (patch[k] !== undefined) row[k] = patch[k];
      if (Object.keys(row).length === 0) return (await sql<RoulettePrize[]>`select * from roulette_prizes where id = ${id}`)[0] ?? null;
      const r = await sql<RoulettePrize[]>`update roulette_prizes set ${sql(row)} where id = ${id} returning *`;
      return r[0] ? { ...r[0] } : null;
    },
    async countUserBadges() {
      const rows = await sql<{ badge_code: string; n: string }[]>`select badge_code, count(*)::int as n from user_badges group by badge_code`;
      return Object.fromEntries(rows.map((r) => [r.badge_code, Number(r.n)]));
    },
    async findProfile(idOrAnonKey) {
      const isUuid = /^[0-9a-f-]{36}$/i.test(idOrAnonKey);
      const r = isUuid
        ? await sql<ProfileRow[]>`select * from profiles where id = ${idOrAnonKey} or anon_key = ${idOrAnonKey}`
        : await sql<ProfileRow[]>`select * from profiles where anon_key = ${idOrAnonKey}`;
      return r[0] ? toProfile(r[0]) : null;
    },
    async listProfiles(limit = 200) {
      return (await sql<ProfileRow[]>`select * from profiles order by created_at desc limit ${limit}`).map(toProfile);
    },
    async listAllUserBadges() {
      const rows = await sql<{ user_id: string; badge_code: string }[]>`select user_id, badge_code from user_badges`;
      return rows.map((r) => ({ userId: r.user_id, badgeCode: r.badge_code }));
    },
    async listAllTagScores() {
      const rows = await sql<{ user_id: string; tag: string; score: number }[]>`select user_id, tag, score from user_tag_scores`;
      return rows.map((r) => ({ userId: r.user_id, tag: r.tag, score: r.score }));
    },
    async dailyStats(dayKeys) {
      if (dayKeys.length === 0) return [];
      const rows = await sql<{ day_key: string; completions: number; points: number; new_users: number; attendance: number }[]>`
        select d.day_key,
          (select count(*) from set_completions c where c.day_key = d.day_key)::int as completions,
          (select coalesce(sum(delta), 0) from point_ledger l where l.delta > 0 and to_char(l.created_at at time zone 'Asia/Seoul', 'YYYY-MM-DD') = d.day_key)::int as points,
          (select count(*) from profiles p where to_char(p.created_at at time zone 'Asia/Seoul', 'YYYY-MM-DD') = d.day_key)::int as new_users,
          (select count(*) from stamps s where s.source_type = 'attendance' and s.source_id = d.day_key)::int as attendance
        from unnest(${sql.array(dayKeys)}::text[]) as d(day_key)`;
      return dayKeys.map((dayKey) => {
        const r = rows.find((x) => x.day_key === dayKey);
        return { dayKey, completions: r?.completions ?? 0, pointsIssued: r?.points ?? 0, newUsers: r?.new_users ?? 0, attendance: r?.attendance ?? 0 };
      });
    },
    async adminStats(dayKey) {
      const [a] = await sql<{ users: number; today: number; issued: number; redeemed: number; stamps: number; spins: number; red: number; store: number; refs: number; rush: number }[]>`
        select
          (select count(*) from profiles)::int as users,
          (select count(*) from set_completions where day_key = ${dayKey})::int as today,
          (select coalesce(sum(delta), 0) from point_ledger where delta > 0)::int as issued,
          (select coalesce(abs(sum(delta)), 0) from point_ledger where delta < 0)::int as redeemed,
          (select count(*) from stamps where consumed_by is null)::int as stamps,
          (select count(*) from roulette_spins)::int as spins,
          (select count(*) from redemptions where status = 'requested')::int as red,
          (select count(*) from store_mission_completions)::int as store,
          (select count(*) from referrals)::int as refs,
          (select count(*) from rush_claims)::int as rush`;
      return { users: a.users, completionsToday: a.today, pointsIssued: a.issued, pointsRedeemed: a.redeemed, freeStamps: a.stamps, spins: a.spins, redemptionsRequested: a.red, storeCompletions: a.store, referrals: a.refs, rushClaims: a.rush };
    },
  };
}
