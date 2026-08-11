import { ExtractionDto } from "../data/models/ExtractionDto";
import { ExtractedActivity, ExtractionWarning } from "./entities/ExtractedActivity";

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

function calculatWarnings(dto: ExtractionDto): ExtractionWarning[] {
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
    const warnings = calculatWarnings(dto);
    
    let date = dto.startedAtIso ? new Date(dto.startedAtIso) : null;
    if(Number.isNaN(date?.getTime())) date = null;

    const calorie = dto.calories ?? undefined;

    return {
        startedAt: date,
        distanceMeters: dto.distanceMeters ?? null,
        durationSeconds: dto.durationSeconds ?? null,
        calories: calorie,
        lowConfidenceFields: dto.lowConfidenceFields,
        warnings: warnings
    };
};