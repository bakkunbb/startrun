import { Segment, SegmentView } from './Segment';

export type ActivitySource = 'gps' | 'strava' | 'health' | 'ai_import';

export type SegmentBearing = {
    laps?: Segment[];
    splits?: Segment[];
    splitUnitMeters?: number;
}

export interface Activity {
    id: string;
    source: ActivitySource;
    startedAt: Date;
    distanceMeters: number;
    durationSeconds: number;
    calories?: number;
    note?: string;
    externalId?: string;
    /** 사용자가 끊은 랩 — 있으면 이쪽을 우선 표시한다 */
    laps?: Segment[];
    /** 거리 기준 자동 분할 */
    splits?: Segment[];
    /** splits가 있을 때만 의미가 있다 (1000 | 1609.34) */
    splitUnitMeters?: number;
}

/** 거리가 0 이하면 null */
export function paceSecPerKm(activity: Activity): number | null {
    if (activity.distanceMeters <= 0) return null;
    return (activity.durationSeconds / activity.distanceMeters) * 1000;
}

/**
 * 표시·계산의 기준이 되는 한 벌을 고른다.
 * 랩이 있으면 랩, 없으면 자동 분할, 둘 다 없거나 단위를 모르면 null.
 */
// export function primarySegments(activity: Activity): SegmentView | null {
export function primarySegments(activity: SegmentBearing): SegmentView | null {
    if (activity.laps && activity.laps.length > 0) {
        return { kind: 'lap', segments: activity.laps };
    } else if (activity.splits && activity.splitUnitMeters) {
        return { kind: 'split', segments: activity.splits, unitMeters: activity.splitUnitMeters };
    } else {
        return null;
    }
}