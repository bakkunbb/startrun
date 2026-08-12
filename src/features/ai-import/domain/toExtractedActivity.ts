import { inferSegmentKind, Segment } from "@/features/activity/domain/entities/Segment";
import { ExtractionDto } from "../data/models/ExtractionDto";
import { ExtractedActivity, ExtractionWarning } from "./entities/ExtractedActivity";
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

function renumber(rows: RawSegmentRow[]): RawSegmentRow[] {
    return [...rows]
        .sort((a, b) => a.index - b.index)
        .map((r, i) => ({...r, index: i + 1}));
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

    for(const segmentSetDto of dto.segmentSets) {
        if(segmentSetDto.rows.length === 0) continue;
        
        const norm = normalizeSegmentRows(renumber(segmentSetDto.rows), total);
        const segments: Segment[] = norm.rows;

        const inferred = segmentSetDto.kind === 'unknown' ? inferSegmentKind(segments) : null;
        const kind = inferred && inferred.kind !== 'unknown'
            ? inferred.kind
            : segmentSetDto.kind !== 'unknown' ? segmentSetDto.kind : 'lap';

        const alreadyFilled = kind === 'split' ? splits !== undefined : laps !== undefined;
        if(alreadyFilled) continue;

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

        if(kind === 'split') {
            splits = segments;
            splitUnitMeters = (inferred?.kind === 'split' ? inferred.unitMeters : segmentSetDto.unitMeters) ?? undefined;
        } else {
            laps = segments;
        }
    }

    return {
        startedAt: date,
        distanceMeters: dto.distanceMeters ?? null,
        durationSeconds: dto.durationSeconds ?? null,
        calories: dto.calories ?? undefined,
        splits,
        laps,
        splitUnitMeters,
        lowConfidenceFields: dto.lowConfidenceFields,
        warnings: [...warnings]
    };
};