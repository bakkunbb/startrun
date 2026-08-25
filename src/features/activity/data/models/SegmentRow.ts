import type { Segment, SegmentKind } from "../../domain/entities/Segment";

export interface SegmentRow {
    activity_id: string;
    kind: SegmentKind;
    idx: number;
    distance_m: number;
    duration_s: number;
    hr: number | null;
}

export function toSegmentEntity(row: SegmentRow): Segment {
    return {
        index: row.idx,
        distanceMeters: row.distance_m,
        durationSeconds: row.duration_s,
        heartRate: row.hr ?? undefined,
    };
}

export function toSegmentRow(activityId: string, kind: SegmentKind, segment: Segment): SegmentRow {
    return {
        activity_id: activityId,
        kind: kind,
        idx: segment.index,
        distance_m: segment.distanceMeters,
        duration_s: segment.durationSeconds,
        hr: segment.heartRate ?? null,
    };
}

/** 한 기록의 구간 행들을 종류별로 나누고 idx 순으로 정렬한다 */
export function groupByKind(rows: SegmentRow[]): { splits: Segment[]; laps: Segment[] } {
    if (rows.length === 0) return { splits: [], laps: [] };

    const splits: Segment[] = [];
    const laps: Segment[] = [];

    for (const row of rows) {
        row.kind === 'split' ? splits.push(toSegmentEntity(row)) : laps.push(toSegmentEntity(row));
    }

    splits.sort((a, b) => a.index - b.index);
    laps.sort((a, b) => a.index - b.index);

    return {
        splits: splits,
        laps: laps
    };
}