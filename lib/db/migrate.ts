import type { Sql } from "postgres";
import { SCHEMA_SQL, SCHEMA_TABLES } from "./schema";
import { SEED_BADGES, SEED_QUIZZES, SEED_SETS } from "@/lib/quiz/seed";
import { SEED_PRIZES } from "@/lib/roulette/seed";
import { SEED_STORE_MISSIONS } from "@/lib/missions/seed";

export interface DbStatus {
  connected: boolean;
  error?: string;
  host?: string;
  tables: { name: string; exists: boolean; rows: number }[];
}

export function maskDbUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username ? u.username + ":***@" : ""}${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    return "(파싱 불가)";
  }
}

export async function dbStatus(sql: Sql, url: string): Promise<DbStatus> {
  const host = maskDbUrl(url);
  try {
    const existing = new Set((await sql<{ table_name: string }[]>`select table_name from information_schema.tables where table_schema = 'public'`).map((r) => r.table_name));
    const tables = [] as DbStatus["tables"];
    for (const name of SCHEMA_TABLES) {
      const exists = existing.has(name);
      const rows = exists ? Number((await sql.unsafe(`select count(*)::int as n from ${name}`))[0]?.n ?? 0) : 0;
      tables.push({ name, exists, rows });
    }
    return { connected: true, host, tables };
  } catch (e) {
    return { connected: false, host, error: e instanceof Error ? e.message : String(e), tables: [] };
  }
}

/** 스키마 적용(idempotent) + 시드(없는 행만). 관리자 DB 화면 버튼과 `pnpm db:migrate` 가 호출 */
export async function migrateAndSeed(sql: Sql): Promise<{ seeded: Record<string, number> }> {
  await sql.unsafe(SCHEMA_SQL);
  const seeded: Record<string, number> = {};
  for (const b of SEED_BADGES) {
    const r = await sql`insert into badges (code, name, description, emoji, rule) values (${b.code}, ${b.name}, ${b.description}, ${b.emoji}, ${sql.json(b.rule)}) on conflict (code) do nothing`;
    seeded.badges = (seeded.badges ?? 0) + r.count;
  }
  for (const s of SEED_SETS) {
    const r = await sql`insert into quiz_sets (id, title, image_url, reward_points, capacity, base_participants, today_only, active, sort, target_badges) values (${s.id}, ${s.title}, ${s.imageUrl}, ${s.rewardPoints}, ${s.capacity}, ${s.baseParticipants}, ${s.todayOnly}, ${s.active}, ${s.sort}, ${sql.array(s.targetBadges ?? [])}::text[]) on conflict (id) do update set image_url = excluded.image_url where quiz_sets.image_url like 'https://picsum.photos/%'`;
    seeded.quiz_sets = (seeded.quiz_sets ?? 0) + r.count;
  }
  for (const q of SEED_QUIZZES) {
    const r = await sql`insert into quizzes (id, set_id, question, kind, active, sort) values (${q.id}, ${q.setId}, ${q.question}, ${q.kind}, ${q.active}, ${q.sort}) on conflict (id) do nothing`;
    seeded.quizzes = (seeded.quizzes ?? 0) + r.count;
    for (const o of q.options) {
      const ro = await sql`insert into quiz_options (id, quiz_id, label, image_url, tags, sort) values (${o.id}, ${q.id}, ${o.label}, ${o.imageUrl ?? null}, ${sql.array(o.tags)}::text[], ${o.sort}) on conflict (id) do update set image_url = excluded.image_url where quiz_options.image_url like 'https://picsum.photos/%'`;
      seeded.quiz_options = (seeded.quiz_options ?? 0) + ro.count;
    }
  }
  for (const p of SEED_PRIZES) {
    const r = await sql`insert into roulette_prizes (id, name, kind, value, weight, active, sort) values (${p.id}, ${p.name}, ${p.kind}, ${p.value}, ${p.weight}, ${p.active}, ${p.sort}) on conflict (id) do nothing`;
    seeded.roulette_prizes = (seeded.roulette_prizes ?? 0) + r.count;
  }
  for (const m of SEED_STORE_MISSIONS) {
    const r = await sql`insert into store_missions (id, store_name, kind, title, description, reward_points, code, capacity, active, sort, created_at) values (${m.id}, ${m.storeName}, ${m.kind}, ${m.title}, ${m.description ?? null}, ${m.rewardPoints}, ${m.code}, ${m.capacity}, ${m.active}, ${m.sort}, ${m.createdAt}) on conflict (id) do nothing`;
    seeded.store_missions = (seeded.store_missions ?? 0) + r.count;
  }
  return { seeded };
}
