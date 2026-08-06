import type { Activity, ActivitySource } from "../../domain/entities/Activity"
import type { Segment } from "../../domain/entities/Segment"

export interface ActivityRow {
    id: string;
    source: string;
    started_at: number;       // epoch millis
    distance_m: number;
    duration_s: number;
    calories: number | null;
    note: string | null;
    external_id: string | null;
    split_unit_m: number | null;
}

/** 구간은 별도 테이블이므로 리포지토리에서 조회해 주입한다 */
export function toEntity(row: ActivityRow, segments?: { splits?: Segment[]; laps?: Segment[] },): Activity {
    return {
        id: row.id,
        source: row.source as ActivitySource,
        startedAt: new Date(row.started_at),
        distanceMeters: row.distance_m,
        durationSeconds: row.duration_s,
        calories: row.calories ?? undefined,
        note: row.note ?? undefined,
        externalId: row.external_id ?? undefined,
        splitUnitMeters: row.split_unit_m ?? undefined,
        laps: segments?.laps,
        splits: segments?.splits,
    }
}

export function toRow(activity: Activity): ActivityRow {
    return {
        id: activity.id,
        source: activity.source,
        started_at: activity.startedAt.getTime(),
        distance_m: activity.distanceMeters,
        duration_s: activity.durationSeconds,
        calories: activity.calories ?? null,
        note: activity.note ?? null,
        external_id: activity.externalId ?? null,
        split_unit_m: activity.splitUnitMeters ?? null
    }
}