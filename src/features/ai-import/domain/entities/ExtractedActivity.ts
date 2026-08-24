import { Segment, SegmentKind } from "@/features/activity/domain/entities/Segment";

/** 구간 종류를 어떤 근거로 판단했는지 */
export type SegmentBasis =
    | { type: 'label'; labelText: string | null }
    | { type: 'inferred' }
    | { type: 'fallback' };

/** 근거를 사용자에게 보여줄 한 줄 문구로 바꾼다 */
export function describeSegmentBasis(basis: SegmentBasis, kind: SegmentKind): string {
    const kindLabel = kind === 'split' ? '자동 분할' : '랩';

    switch (basis.type) {
        case 'label':
            return basis.labelText
                ? `화면에 '${basis.labelText}'라고 적혀 있어 ${kindLabel}으로 판단했어요`
                : `화면에 표시된 이름으로 ${kindLabel}으로 판단했어요`;
        case 'inferred':
            return kind === 'split'
                ? '1km 간격이라 자동 분할로 판단했어요'
                : '구간 간격이 일정하지 않아 랩으로 판단했어요';
        case 'fallback':
            return '종류를 판단하지 못해 랩으로 표시했어요';
    }
}

export type ExtractionWarning =
    | 'missing_started_at'
    | 'invalid_started_at'
    | 'missing_distance'
    | 'missing_duration'
    | 'segments_unverified'
    | 'unknown_segment_kind';

/** 검토전 상태. Activity와 달리 필수 필드가 null일 수 있다 */
export type ExtractedActivity = {
    startedAt: Date | null;
    distanceMeters: number | null;
    durationSeconds: number | null;
    heartRate: number | null;
    calories?: number;
    splits?: Segment[];
    laps?: Segment[];
    splitUnitMeters?: number;
    splitsBasis?: SegmentBasis;
    lapsBasis?: SegmentBasis;
    /** LLM이 확신하지 못한 필드 */
    lowConfidenceFields: string[];
    /** 산술로 걸러낸 warning */
    warnings: ExtractionWarning[];
}