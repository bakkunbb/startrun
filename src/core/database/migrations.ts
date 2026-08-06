import { SqlDatabase } from "./types"

export const MIGRATIONS: string[][] = [
    [
        `CREATE TABLE activities (
            id           TEXT PRIMARY KEY,
            source       TEXT NOT NULL,
            started_at   INTEGER NOT NULL,
            distance_m   REAL NOT NULL,
            duration_s   INTEGER NOT NULL,
            calories     INTEGER,
            note         TEXT,
            external_id  TEXT,
            split_unit_m REAL
        );`,
        `CREATE INDEX idx_activities_started_at ON activities(started_at DESC);`,
        `CREATE UNIQUE INDEX idx_activities_source_external ON activities(source, external_id) WHERE external_id IS NOT NULL;`,
        `CREATE TABLE activity_segments(
            activity_id TEXT NOT NULL,
            kind        TEXT NOT NULL CHECK(kind IN('split', 'lap')),
            idx         INTEGER NOT NULL,
            distance_m  REAL NOT NULL,
            duration_s  INTEGER NOT NULL,
            PRIMARY KEY(activity_id, kind, idx),
            FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE
        );`
    ],
]

/**
 * PRAGMA user_version을 읽어 부족한 마이그레이션만 순서대로 적용한다.
 * @returns 적용 후 최종 버전
 */
export async function migrate(db: SqlDatabase, migrations?: string[][]): Promise<number> {
    const versionResult = await db.execute('PRAGMA user_version');
    const currentVersion = (versionResult.rows[0]?.user_version ?? 0) as number;

    migrations = migrations ?? MIGRATIONS;

    if (currentVersion >= migrations.length) {
        return currentVersion;
    }

    await db.transaction(async (tx) => {
        for (let version = currentVersion; version < (migrations ?? MIGRATIONS).length; version++) {
            for (const statement of migrations[version]) {
                await tx.execute(statement);
            }
        }
        await tx.execute(`PRAGMA user_version = ${migrations.length}`);
    });

    return migrations.length;
}