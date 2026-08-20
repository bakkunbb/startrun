import { getContainer } from "@/core/di/container";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "./activityKeys";

export function useDeleteActivity(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async(id: string) => {
            const { activityRepository } = await getContainer();
            await activityRepository.remove(id);
        },
        onSuccess: () => queryClient.invalidateQueries( { queryKey: activityKeys.all }),
    })
}