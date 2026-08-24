import { inferSegmentKind, Segment } from "@/features/activity/domain/entities/Segment";
import { ExtractionDto, SegmentSetDto } from "../data/models/ExtractionDto";
import { ExtractedActivity, ExtractionWarning, SegmentBasis } from "./entities/ExtractedActivity";
import { normalizeSegmentRows, RawSegmentRow } from "./normalizeSegments";

function checkDate(dateString: string | null): ExtractionWarning | null {
    if(!dateString) {
        return 'missing_started_at';
    } else {
        const date = new Date(dateString);
        if(Number.isNaN(date.getTime())) {
            return 'invalid_started_at';
        }
    }

    return null;
}

function checkDistance(distanceMeters: number | null): ExtractionWarning | null {
    if(distanceMeters === null) return 'missing_distance';
    return null;
}

function checkDuration(durationSeconds: number | null): ExtractionWarning | null {
    if(durationSeconds === null) return 'missing_duration';
    return null;
}

// function renumber(rows: RawSegmentRow[]): RawSegmentRow[] {
//     return [...rows]
//         .sort((a, b) => a.index - b.index)
//         .map((r, i) => ({...r, index: i + 1}));
// }

/** 표 안에서만 순서를 바로잡는다. 번호는 그대로 둔다 */
function orderWithin(rows: RawSegmentRow[]): RawSegmentRow[] {
  return [...rows].sort((a, b) => a.index - b.index);
}

/** 최종 순서대로 1..n을 매긴다. 정렬하지 않는다 */
function assignSequential(rows: RawSegmentRow[]): RawSegmentRow[] {
  return rows.map((r, i) => ({ ...r, index: i + 1 }));
}

function calculateWarnings(dto: ExtractionDto): ExtractionWarning[] {
    const warnings: ExtractionWarning[] = [];

    const dateWarning = checkDate(dto.startedAtIso);
    if(dateWarning != null) warnings.push(dateWarning);
    const distanceWarning = checkDistance(dto.distanceMeters);
    if(distanceWarning != null) warnings.push(distanceWarning);
    const durationWarning = checkDuration(dto.durationSeconds);
    if(durationWarning != null) warnings.push(durationWarning);

    return warnings;
}

export function toExtractedActivity(dto: ExtractionDto): ExtractedActivity {
    const warnings = new Set(calculateWarnings(dto));
    
    let date = dto.startedAtIso ? new Date(dto.startedAtIso) : null;
    if(Number.isNaN(date?.getTime())) date = null;

    const total = {
        distanceMeters: dto.distanceMeters ?? undefined,
        durationSeconds: dto.durationSeconds ?? undefined,
    };

    let splits: Segment[] | undefined;
    let laps: Segment[] | undefined;
    let splitUnitMeters: number | undefined;
    let splitsBasis: SegmentBasis | undefined;
    let lapsBasis: SegmentBasis | undefined;

    const grouped: Record<SegmentSetDto['kind'], RawSegmentRow[]> = {
        split: [],
        lap: [],
        unknown: [],
    };
    let declaredUnit: number | undefined;
    const declaredLabelText: Partial<Record<'split' | 'lap', string>> = {};

    for(const set of dto.segmentSets ?? []) {
        if(!set.rows || set.rows.length === 0) continue;
        grouped[set.kind].push(...orderWithin(set.rows));
        if (set.kind === 'split' && set.unitMeters != null) {
            declaredUnit ??= set.unitMeters;
        }
        if (set.kind !== 'unknown' && set.labelText) {
            declaredLabelText[set.kind] ??= set.labelText;
        }
    }

    for(const [declared, rows] of Object.entries(grouped)) {
        if(rows.length === 0) continue;

        const norm = normalizeSegmentRows(assignSequential(rows), total);
        const segments: Segment[] = norm.rows;

        const inferred = declared === 'unknown' ? inferSegmentKind(segments) : null;
        const kind = inferred && inferred.kind !== 'unknown'
            ? inferred.kind
            : declared !== 'unknown' ? declared : 'lap';

        const basis: SegmentBasis = declared !== 'unknown'
            ? { type: 'label', labelText: declaredLabelText[declared as 'split' | 'lap'] ?? null }
            : inferred && inferred.kind !== 'unknown'
                ? { type: 'inferred' }
                : { type: 'fallback' };

        if(inferred?.kind === 'unknown') {
            warnings.add('unknown_segment_kind');
        }
        if(norm.distanceReading === 'ambiguous' || norm.durationReading === 'ambiguous') {
            warnings.add('segments_unverified');
        }
        const sum = segments.reduce((acc, s) => acc + s.distanceMeters, 0);
        if(total.distanceMeters !== undefined && sum !== total.distanceMeters) {
            warnings.add('segments_unverified');
        }

        if (kind === 'split') {
            const reindexed = [...segments].map((r, i) => ({...r, index: splits ? splits.length + i + 1 : i + 1}));
            splits = splits ? [...splits, ...reindexed] : reindexed;
            splitUnitMeters = (inferred?.kind === 'split' ? inferred.unitMeters : declaredUnit) ?? undefined;
            splitsBasis = basis;
        } else {
            laps = laps ? [...laps, ...segments] : segments;
            lapsBasis = basis;
        }
    }

    if (splits) splits = assignSequential(splits);
    if (laps) laps = assignSequential(laps);

    return {
        startedAt: date,
        distanceMeters: dto.distanceMeters ?? null,
        durationSeconds: dto.durationSeconds ?? null,
        heartRate: dto.heartRate ?? null,
        calories: dto.calories ?? undefined,
        splits,
        laps,
        splitUnitMeters,
        splitsBasis,
        lapsBasis,
        lowConfidenceFields: dto.lowConfidenceFields,
        warnings: [...warnings]
    };
};