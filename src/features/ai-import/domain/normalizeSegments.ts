export type RawSegmentRow = {
    index: number;
    distanceMeters: number;
    durationSeconds: number;
};

/** 'ambiguous'는 판단 불가라 원본을 그대로 둔다 */
export type Reading = 'per_segment' | 'cumulative' | 'ambiguous';
 
export type NormalizeResult = {
    rows: RawSegmentRow[];
    distanceReading: Reading;
    durationReading: Reading;
};

/** 총합의 2% 내외, 최소값 minAbs는 오차로 인정 */
function toleranceFor(total: number, minAbs: number): number {
    return Math.max(Math.abs(total) * 0.02, minAbs);
}

/** 값이 순증가하는지 확인 */
function isIncreasing(values: number[]): boolean {
    return values.every((v, i) => i === 0 || v > values[i - 1]);
}

/** 누적값 -> 구간값 반환 */
function diffFromCumulative(values: number[]): number [] {
    return values.map((v, i) => i === 0 ? v : v - values[i - 1]);
}

function detectReading(values: number[], total: number | undefined, minAbs: number): Reading {
    if(values.length <= 1) return 'per_segment';
    if(!isIncreasing(values)) return 'per_segment';
    if(total === undefined) return 'ambiguous';

    const tol = toleranceFor(total, minAbs);
    const sum = values.reduce((a, b) => a + b, 0);
    const last = values[values.length - 1];

    const sumMatches = Math.abs(sum - total) <= tol;
    const lastMatches = Math.abs(last - total) <= tol;

    if(lastMatches && !sumMatches) return 'cumulative';
    if(sumMatches && !lastMatches) return 'per_segment';
    return 'ambiguous';
}

export function normalizeSegmentRows(rows: RawSegmentRow[], total: { distanceMeters?: number; durationSeconds?: number; }): NormalizeResult {
    const distances = rows.map(r => r.distanceMeters);
    const durations = rows.map(r => r.durationSeconds);

    let distanceReading = detectReading(distances, total.distanceMeters, 50);
    let durationReading = detectReading(durations, total.durationSeconds, 10);

    let fixedDistances = distances;
    let fixedDurations = durations;

    if(distanceReading === 'cumulative') {
        const diff = diffFromCumulative(distances);
        if(diff.some((v) => v <= 0)) {
            distanceReading = 'ambiguous';
        } else {
            fixedDistances = diff;
        }
    }

    if(durationReading === 'cumulative') {
        const diff = diffFromCumulative(durations);
        if(diff.some((v) => v <= 0)) {
            durationReading = 'ambiguous';
        } else {
            fixedDurations = diff;
        }
    }

    return {
        rows: rows.map((r, i) => ({
            index: r.index,
            distanceMeters: fixedDistances[i],
            durationSeconds: fixedDurations[i],
        })),
        distanceReading: distanceReading,
        durationReading: durationReading,
    };
}