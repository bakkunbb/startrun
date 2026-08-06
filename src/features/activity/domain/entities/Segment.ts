export interface Segment {
    index: number;          // 1부터 시작
    distanceMeters: number;
    durationSeconds: number;
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
        }
    }

    return { kind: 'lap' };
}