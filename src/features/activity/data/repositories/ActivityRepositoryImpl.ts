import { Activity } from "../../domain/entities/Activity";
import { ActivityRepository } from "../../domain/repositories/ActivityRepository";
import { ActivityLocalDataSource } from "../datasources/ActivityLocalDataSources";
import { toEntity, toRow } from "../models/ActivityRow";
import { groupByKind, SegmentRow, toSegmentRow } from "../models/SegmentRow";

const nonEmpty = <T>(a: T[]) => (a.length > 0 ? a : undefined);

export class ActivityRepositoryImpl implements ActivityRepository {
    constructor(private local: ActivityLocalDataSource) { }

    async getAll(): Promise<Activity[]> {
        const rows = await this.local.findAll();
        if (rows.length === 0) return [];

        const segRows = await this.local.findSegments(rows.map((r) => r.id));

        const byActivity = new Map<string, SegmentRow[]>();
        for (const s of segRows) {
            const list = byActivity.get(s.activity_id) ?? [];
            list.push(s);
            byActivity.set(s.activity_id, list);
        }

        return rows.map((r) => {
            const g = groupByKind(byActivity.get(r.id) ?? []);
            return toEntity(r, {
                splits: nonEmpty(g.splits),
                laps: nonEmpty(g.laps)
            });
        });
    }

    async getById(id: string): Promise<Activity | null> {
        const row = await this.local.findById(id);
        if (!row) return null;
        const segRows = await this.local.findSegments([id]);
        const g = groupByKind(segRows);
        return toEntity(row, { splits: nonEmpty(g.splits), laps: nonEmpty(g.laps) });
    }

    async save(activity: Activity): Promise<void> {
        const segmentRows = [
            ...(activity.splits ?? []).map((s) => toSegmentRow(activity.id, 'split', s)),
            ...(activity.laps ?? []).map((s) => toSegmentRow(activity.id, 'lap', s))
        ];

        await this.local.upsert(toRow(activity), segmentRows);
    }

    async remove(id: string): Promise<void> {
        await this.local.deleteById(id);
    }

    async findNear(startedAt: Date, toleranceMinutes: number): Promise<Activity[]> {
        const rows = await this.local.findNear(startedAt.getTime(), toleranceMinutes * 60 * 1000);
        if (rows.length === 0) return [];

        const segRows = await this.local.findSegments(rows.map((r) => r.id));
        const byActivity = new Map<string, SegmentRow[]>();
        for (const s of segRows) {
            const list = byActivity.get(s.activity_id) ?? [];
            list.push(s);
            byActivity.set(s.activity_id, list);
        }
        return rows.map((r) => {
            const g = groupByKind(byActivity.get(r.id) ?? []);
            return toEntity(r, { splits: g.splits, laps: g.laps });
        });
    }
}