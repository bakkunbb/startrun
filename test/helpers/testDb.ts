import Database from 'better-sqlite3';
import type { SqlDatabase, SqlResult } from '@/core/database/types';

/**
 * 테스트용 인메모리 SQLite.
 * 앱에서 쓸 RN 라이브러리와 같은 SqlDatabase 인터페이스를 구현하므로,
 * 도메인·마이그레이션 코드는 수정 없이 그대로 검증할 수 있다.
 */
export function createTestDb(): SqlDatabase {
  const raw = new Database(':memory:');
  // FK 제약은 커넥션마다 켜야 한다. 앱의 DB 클라이언트에서도 반드시 켤 것.
  raw.pragma('foreign_keys = ON');

  const wrap = (db: Database.Database): SqlDatabase => ({
    async execute(sql: string, params: unknown[] = []): Promise<SqlResult> {
      const trimmed = sql.trim();
      const isRead =
        /^(SELECT|PRAGMA)\b/i.test(trimmed) && !/^PRAGMA\s+\w+\s*=/i.test(trimmed);

      if (isRead) {
        const rows = db.prepare(trimmed).all(...(params as any[]));
        return { rows: rows.map((r) => ({ ...(r as object) })), rowsAffected: 0 };
      }
      if (params.length === 0) {
        db.exec(trimmed);
        return { rows: [], rowsAffected: 0 };
      }
      const info = db.prepare(trimmed).run(...(params as any[]));
      return { rows: [], rowsAffected: Number(info.changes ?? 0) };
    },

    async transaction<T>(fn: (tx: SqlDatabase) => Promise<T>): Promise<T> {
      db.exec('BEGIN');
      try {
        const out = await fn(wrap(db));
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },

    async close(): Promise<void> {
      db.close();
    },
  });

  return wrap(raw);
}

export async function tableNames(db: SqlDatabase): Promise<string[]> {
  const res = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  return res.rows.map((r) => r.name);
}

export async function userVersion(db: SqlDatabase): Promise<number> {
  const res = await db.execute('PRAGMA user_version');
  return res.rows[0].user_version;
}
