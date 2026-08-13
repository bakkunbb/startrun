import { PickedImage } from "@/core/media/imagePicker";
import { ExtractedActivity } from "../../domain/entities/ExtractedActivity";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toExtractedActivity } from "../../domain/toExtractedActivity";
import { requestExtraction } from "../../data/datasources/aiExtractionApi";

export function useExtractActivity(): UseMutationResult<ExtractedActivity, Error, PickedImage[]> {
    const mutate = useMutation({
        mutationFn: async (images: PickedImage[]) => toExtractedActivity(await requestExtraction(images)),
    });

    return mutate;
}