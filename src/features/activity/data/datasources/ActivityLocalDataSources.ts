import { SqlDatabase } from "@/core/database/types";
import { ActivityRow } from "../models/ActivityRow";
import { SegmentRow } from "../models/SegmentRow";

export class ActivityLocalDataSource {
    constructor(private db: SqlDatabase) { }

    async findAll(): Promise<ActivityRow[]> {
        const { rows } = await this.db.execute('SELECT * FROM activities ORDER BY started_at DESC');
        return rows as ActivityRow[];
    }

    async findById(id: string): Promise<ActivityRow | null> {
        const { rows } = await this.db.execute('SELECT * FROM activities WHERE id = ?', [id]);
        return rows.length > 0 ? (rows[0] as ActivityRow) : null;
    }

    async findNear(startedAtMs: number, toleranceMs: number): Promise<ActivityRow[]> {
        const { rows } = await this.db.execute(
            'SELECT * FROM activities WHERE started_at BETWEEN ? AND ?',
            [startedAtMs - toleranceMs, startedAtMs + toleranceMs]
        );
        return rows as ActivityRow[];
    }

    async findSegments(activityIds: string[]): Promise<SegmentRow[]> {
        if (activityIds.length === 0) return [];
        const placeholders = activityIds.map(() => '?').join(',');
        const { rows } = await this.db.execute(
            `SELECT * FROM activity_segments WHERE activity_id IN (${placeholders}) ORDER BY activity_id, kind, idx`,
            activityIds
        );
        return rows as SegmentRow[];
    }

    async upsert(row: ActivityRow, segmentRows: SegmentRow[]): Promise<void> {
        await this.db.transaction(async tx => {
            await tx.execute(
                `INSERT INTO activities
                (id, source, started_at, distance_m, duration_s, avg_hr, calories, note, external_id, split_unit_m)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                source = excluded.source,
                started_at = excluded.started_at,
                distance_m = excluded.distance_m,
                duration_s = excluded.duration_s,
                avg_hr = excluded.avg_hr,
                calories = excluded.calories,
                note = excluded.note,
                external_id = excluded.external_id,
                split_unit_m = excluded.split_unit_m`,
                [row.id, row.source, row.started_at, row.distance_m, row.duration_s, row.avg_hr, row.calories, row.note, row.external_id, row.split_unit_m]
            );
            await tx.execute('DELETE FROM activity_segments WHERE activity_id = ?', [row.id]);
            for (const seg of segmentRows) {
                await tx.execute(
                    `INSERT INTO activity_segments
                    (activity_id, kind, idx, distance_m, duration_s, hr)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [seg.activity_id, seg.kind, seg.idx, seg.distance_m, seg.duration_s, seg.hr]
                );
            }
        });
    }

    async deleteById(id: string): Promise<void> {
        const { rowsAffected } = await this.db.execute('DELETE FROM activities WHERE id = ?', [id]);
        if (rowsAffected === 0) {
            throw new Error(`Activity with id ${id} not found`);
        }
    }
}