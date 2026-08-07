import { createDatabase } from './opSqliteAdapter';
import { migrate } from './migrations';
import type { SqlDatabase } from './types';

let instance: Promise<SqlDatabase> | null = null;

export function getDatabase(): Promise<SqlDatabase> {
    if (!instance) {
        instance = (async () => {
            const db = createDatabase();
            await migrate(db);
            return db;
        })();
    }
    return instance;
}

/** 안전하게 DB를 닫는다. 호출 전 getDatabase()가 성공했어야 한다. */
export async function disposeDatabase() {
    if (!instance) return;
    const db = await instance;
    await db.close();
    instance = null;
}