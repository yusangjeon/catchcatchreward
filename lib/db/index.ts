import "server-only";
import type { Repo } from "./repo";
import { memoryRepo } from "./memory";
import { createPostgresRepo } from "./postgres";

let cached: Repo | undefined;

/** DATABASE_URL(Postgres/Supabase 연결 문자열)이 있으면 Postgres, 없으면 인메모리. */
export function getRepo(): Repo {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  cached = url ? createPostgresRepo(url) : memoryRepo;
  return cached;
}

export function repoKind(): "postgres" | "memory" {
  return process.env.DATABASE_URL ? "postgres" : "memory";
}
