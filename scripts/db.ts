/**
 * DB CLI — `pnpm db:sql` (스키마 SQL 파일 생성) / `pnpm db:migrate` (DATABASE_URL 에 스키마 적용 + 시드) / `pnpm db:status`
 * 실행: pnpm db:sql | pnpm db:migrate | pnpm db:status (tsx)
 */
import { writeFileSync } from "node:fs";
import postgres from "postgres";
import { SCHEMA_SQL } from "@/lib/db/schema";
import { dbStatus, migrateAndSeed } from "@/lib/db/migrate";

const cmd = process.argv[2];
if (cmd === "sql") {
  writeFileSync("supabase/migrations/0001_init.sql", `-- 자동 생성: lib/db/schema.ts (pnpm db:sql). 직접 수정하지 말 것.\n${SCHEMA_SQL}`);
  console.log("supabase/migrations/0001_init.sql 생성");
  process.exit(0);
}
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL 이 필요합니다");
    process.exit(1);
  }
  const sql = postgres(url, { prepare: false, max: 2 });
  try {
    if (cmd === "migrate") {
      const r = await migrateAndSeed(sql);
      console.log("스키마 적용 완료, 시드:", r.seeded);
    } else if (cmd === "status") {
      console.log(JSON.stringify(await dbStatus(sql, url), null, 1));
    } else {
      console.error("사용법: db.ts <sql|migrate|status>");
    }
  } finally {
    await sql.end();
  }
}
void main();
