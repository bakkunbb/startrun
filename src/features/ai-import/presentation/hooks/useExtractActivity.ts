import { PickedImage } from "@/core/media/imagePicker";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { ExtractionError, requestExtraction } from "../../data/datasources/aiExtractionApi";
import { ExtractionDto } from "../../data/models/ExtractionDto";

export function useExtractActivity(): UseMutationResult<ExtractionDto, ExtractionError, PickedImage[]> {
    const mutate = useMutation<ExtractionDto, ExtractionError, PickedImage[]>({
        mutationFn: async (images: PickedImage[]) => requestExtraction(images),
    });

    return mutate;
}