import { RawSegmentRow } from "../../domain/normalizeSegments";

export type SegmentSetDto = {
    kind: 'split' | 'lap' | 'unknown';
    labelText: string | null;
    unitMeters: number | null;
    rows: RawSegmentRow[];
};

export type ExtractionDto = {
    startedAtIso: string | null;
    distanceMeters: number | null;
    durationSeconds: number | null;
    heartRate: number | null;
    calories: number | null;
    segmentSets: SegmentSetDto[];
    lowConfidenceFields: string [];
};