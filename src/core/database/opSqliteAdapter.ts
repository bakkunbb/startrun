import { open } from '@op-engineering/op-sqlite';
import type { SqlDatabase, SqlResult } from './types';

type Executor = { execute(sql: string, params?: any[]): Promise<any> };

function makeExecute(exec: Executor) {
    return async (sql: string, params: unknown[] = []): Promise<SqlResult> => {
        const raw = await exec.execute(sql, params as any[]);
        return {
            rows: raw?.rows ?? [],
            rowsAffected: raw?.rowsAffected ?? 0,
        };
    };
}

export function createDatabase(): SqlDatabase {
    const db = open({ name: 'startrun.db' });

    // 커넥션마다 설정해야함. 빠뜨리면 CASCADE 삭제가 안됨
    db.executeSync('PRAGMA foreign_keys = ON');

    return {
        execute: makeExecute(db),
        async transaction<T>(fn: (tx: SqlDatabase) => Promise<T>): Promise<T> {
            let result: T;

            //콜백 안에서 예외가 나면 op-sqlite가 자동으로 Rollback
            await db.transaction(async (tx) => {
                result = await fn({
                    execute: makeExecute(tx),
                    transaction: () => Promise.reject(new Error('중첩 트랜잭션은 지원하지 않습니다')),
                    close: () => Promise.reject(new Error('트랜잭션 내부에서는 닫을 수 없습니다')),
                });
            });

            return result!;
        },
        async close() {
            db.close();
        },
    };
}