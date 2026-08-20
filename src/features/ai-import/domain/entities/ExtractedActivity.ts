import { Segment } from "@/features/activity/domain/entities/Segment";

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
    /** LLM이 확신하지 못한 필드 */
    lowConfidenceFields: string[];
    /** 산술로 걸러낸 warning */
    warnings: ExtractionWarning[];
}