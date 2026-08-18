import { formatDistanceKm, formatDuration } from "@/core/utils/format";
import { ExtractedActivity } from "../../domain/entities/ExtractedActivity";
import { ReviewDraft, validateDraft, ValidationError } from "../../domain/reviewDraft";
import { useState } from "react";
import { parseCalories, parseDistanceKm, parseDuration } from "../../domain/parseInput";

export function useReviewDraft(extracted: ExtractedActivity): {
    draft: ReviewDraft;
    errors: ValidationError[];
    canSave: boolean;
    setDistanceInput(text: string): void;
    setDurationInput(text: string): void;
    setCaloriesInput(tex: string): void;
    setStartedAt(date: Date): void;
    setNote(text: string): void;
    /** 화면에 표시할 원본 입력값 */
    inputs: {
        distance: string;
        duration: string;
        calories: string;
        note: string;
    };
} {

    const [startedAt, setStartedAt] = useState(extracted.startedAt);
    
    const [distanceInput, setDistanceInput] = useState(
        extracted.distanceMeters === null ? '' : formatDistanceKm(extracted.distanceMeters),
    );
    const distanceMeters = parseDistanceKm(distanceInput);

    const [durationInput, setDurationInput] = useState(
        extracted.durationSeconds === null ? '' : formatDuration(extracted.durationSeconds),
    );
    const durationSeconds = parseDuration(durationInput);

    const [caloriesInput, setCaloriesInput] = useState(
        extracted.calories === null || extracted.calories === undefined ? '' : String(extracted.calories),
    );
    const calories = parseCalories(caloriesInput);

    const [note, setNote] = useState('');

    const draft: ReviewDraft = {
        startedAt: startedAt,
        distanceMeters: distanceMeters,
        durationSeconds: durationSeconds,
        calories: calories === null ? undefined : calories,
        note: note === '' ? undefined : note,
        splits: extracted.splits,
        laps: extracted.laps,
        splitUnitMeters: extracted.splitUnitMeters,
    }

    const errors = validateDraft(draft, new Date());
    const canSave = errors.length === 0;

    return {
        draft,
        errors,
        canSave,
        setDistanceInput,
        setDurationInput,
        setCaloriesInput,
        setStartedAt,
        setNote,
        inputs: {
            distance: distanceInput,
            duration: durationInput,
            calories: caloriesInput,
            note: note,
        }
    }
}
