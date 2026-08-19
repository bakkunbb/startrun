import { PickedImage } from "@/core/media/imagePicker";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { requestExtraction } from "../../data/datasources/aiExtractionApi";
import { ExtractionDto } from "../../data/models/ExtractionDto";

export function useExtractActivity(): UseMutationResult<ExtractionDto, Error, PickedImage[]> {
    const mutate = useMutation({
        mutationFn: async (images: PickedImage[]) => requestExtraction(images),
    });

    return mutate;
}