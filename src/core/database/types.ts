export interface SqlResult {
    rows: any[];
    rowsAffected: number;
}

export interface SqlDatabase {
    execute(sql: string, params?: unknown[]): Promise<SqlResult>;
    transaction<T>(fn: (tx: SqlDatabase) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}