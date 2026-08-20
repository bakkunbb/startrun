import { getContainer } from "@/core/di/container";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "./activityKeys";

export function useUpdateNote(): UseMutationResult<void, Error, { id: string, note: string }> {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: async({ id, note }: {id: string, note: string}) => {
            const { activityRepository, saveActivity } = await getContainer();
            const current = await activityRepository.getById(id);
            if(!current) throw new Error('기록을 찾을 수 없습니다');
            await saveActivity({ ...current, note: note.trim() || undefined });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    });

    return mutate;
}