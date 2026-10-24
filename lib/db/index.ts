import "server-only";
import type { Repo } from "./repo";
import { memoryRepo } from "./memory";
import { createSupabaseRepo } from "./supabase";

let cached: Repo | undefined;

/** SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 가 있으면 Supabase, 없으면 인메모리. */
export function getRepo(): Repo {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createSupabaseRepo(url, key) : memoryRepo;
  return cached;
}

export function repoKind(): "supabase" | "memory" {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "memory";
}
