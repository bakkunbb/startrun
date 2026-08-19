import { Activity } from "@/features/activity/domain/entities/Activity";
import { Segment } from "@/features/activity/domain/entities/Segment";

export type ReviewDraft = {
    startedAt: Date | null;
    distanceMeters: number | null;
    durationSeconds: number | null;
    calories?: number;
    note?: string;
    splits?: Segment[];
    laps?: Segment[];
    splitUnitMeters?: number;
}

export type ValidationError = 
    | 'distance_required'
    | 'distance_invalid'
    | 'duration_required'
    | 'duration_invalid'
    | 'started_at_required'
    | 'started_at_future';

export function validateDraft(draft: ReviewDraft, now?: Date): ValidationError[] {
    const err: ValidationError[] = [];
    if(draft.distanceMeters === null) {
        err.push('distance_required');
    } else if(draft.distanceMeters <= 0) {
        err.push('distance_invalid');
    }
    
    if(draft.durationSeconds === null) {
        err.push('duration_required');
    } else if(draft.durationSeconds <= 0) {
        err.push('duration_invalid');
    }
    
    if(draft.startedAt === null) {
        err.push('started_at_required');
    } else if(draft.startedAt > new Date((now ?? new Date()).getTime() + 30_000)) {
        err.push('started_at_future');
    }

    return err;
}

export function toActivity(draft: ReviewDraft, id: string): Activity {
    const errors = validateDraft(draft);
    if (errors.length > 0) {
        throw new Error("Validation failed: " + errors.join(", "));
    }
    
    return {
        id,
        source: 'ai_import',
        startedAt: draft.startedAt!,
        distanceMeters: draft.distanceMeters!,
        durationSeconds: draft.durationSeconds!,
        calories: draft.calories,
        note: draft.note,
        splits: draft.splits,
        laps: draft.laps,
        splitUnitMeters: draft.splitUnitMeters,
    }
}