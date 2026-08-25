export interface Segment {
    index: number;          // 1부터 시작
    distanceMeters: number;
    durationSeconds: number;
    heartRate?: number;
}

export type SegmentKind = 'split' | 'lap';  //split => 자동분할 / lap => 수동 랩

/** 표시 / 계산의 단위가 되는 한 벌 */
export type SegmentView =
    | { kind: 'lap'; segments: Segment[] }
    | { kind: 'split'; segments: Segment[]; unitMeters: number };

export function segmentPaceSecPerKm(segment: Segment): number | null {
    if (segment.distanceMeters === 0) return null;
    return (segment.durationSeconds / segment.distanceMeters) * 1000;
}

export type SegmentSummary = {
    /** 표시용 전체 구간 수*/
    count: number;
    /** 계산에 쓴 구간 수 */
    measuredCount: number;
    fastestPace: number;
    slowestPace: number;
    averagePace: number;
    /** 최고와 최저의 차이 - 페이스가 얼마나 일정했는지 */
    spread: number;
    highestHr: number | undefined;
    averageHr: number | undefined;
}

/**
 * index(1-based)가 자투리 구간인지.
 * 자동 분할의 마지막 구간이면서 단위의 90% 미만일 때만 true.
 * 랩에는 자투리 개념이 없으므로 항상 false
 */
export function isRemainder(view: SegmentView, index: number): boolean {
    if (view.kind !== 'split') return false;
    if (index !== view.segments.length) return false;

    return view.segments[index - 1].distanceMeters < view.unitMeters * 0.9;
}

/** 자투리를 제외하고 가장 빠른 구간. 랩은 전부 포함. 없으면 null */
export function fastestSegment(view: SegmentView): Segment | null {
    if (view.kind === 'split' && view.segments.length === 1) return null;

    const splits = view.kind === 'split' ? view.segments.slice(0, -1) : view.segments;

    if (splits.length === 0) return null;

    let fastest: Segment | null = null;
    let fastestPace = Infinity;

    for (const split of splits) {
        const pace = segmentPaceSecPerKm(split);
        if (pace === null) continue;
        if (pace < fastestPace) {
            fastestPace = pace;
            fastest = split;
        }
    }

    return fastest;
}

export type InferredKind =
    | { kind: 'split'; unitMeters: number }
    | { kind: 'lap' }
    | { kind: 'unknown' };

/** 표 제목을 못 읽었을 때 쓰는 풀백 추정 */
export function inferSegmentKind(segments: Segment[], toleranceMeters?: number): InferredKind {
    const candidates = segments.slice(0, -1);
    if (candidates.length < 2) return { kind: 'unknown' };

    const dists = candidates.map(s => s.distanceMeters);
    const min = Math.min(...dists);
    const max = Math.max(...dists);
    const tolerance = toleranceMeters ?? 20;

    if (max - min <= tolerance) {
        const average = (min + max) / 2;
        if (Math.abs(average - 1000) <= tolerance) {
            return { kind: 'split', unitMeters: 1000 };
        } else if (Math.abs(average - 1609.34) <= tolerance) {
            return { kind: 'split', unitMeters: 1609.34 };
        } else {
            return { kind: 'unknown'};
        }
    }

    return { kind: 'lap' };
}

/** 구간이 없거나 페이스를 낼 수 없으면 null */
export function segmentSummary(view: SegmentView | null): SegmentSummary | null {
    if(view === null) return null;
    if(view.segments.length === 0) return null;

    // let count = view.segments.length;
    let segments = view.segments;

    if(view.kind === 'split') {
        segments = segments.filter(s => !isRemainder(view, s.index));
    }

    // const fastestPace = segments.reduce((a, b) => a === null ? 0 : segmentPaceSecPerKm(a) > b === null ? 0 : segmentPaceSecPerKm(b) ? a : b, segments[0]);
    let fastestPace = Infinity;
    let slowestPace = 0;

    for (const split of segments) {
        const pace = segmentPaceSecPerKm(split);
        if (pace === null) continue;
        if (pace < fastestPace) {
            fastestPace = pace;
        } else {
            if(pace > slowestPace) {
                slowestPace = pace;
            }
        }
    }

    const durationSum = segments.reduce((a, b) => a + b.durationSeconds, 0);
    const distanceSum = segments.reduce((a, b) => a + b.distanceMeters, 0);
    const heartRates = segments
        .map(s => s.heartRate)
        .filter((hr): hr is number => hr !== undefined);
    const highestHr = heartRates.length > 0 ? Math.max(...heartRates) : undefined;
    const averageHr = heartRates.length > 0
        ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
        : undefined;

    if(fastestPace === Infinity || distanceSum <= 0) return null;

    return {
        count: view.segments.length,
        measuredCount: segments.length,
        fastestPace: fastestPace,
        slowestPace: slowestPace,
        averagePace: durationSum / distanceSum * 1000,
        spread: slowestPace - fastestPace,
        highestHr: highestHr,
        averageHr: averageHr,
    };

}