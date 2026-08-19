import { Activity } from "@/features/activity/domain/entities/Activity";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getContainer } from "@/core/di/container";

export function useDuplicateCheck(startedAt: Date | null): UseQueryResult<Activity[]> {
    return useQuery({
        queryKey: ['activities', 'near', startedAt?.getTime()],
        queryFn: async () => (await getContainer()).activityRepository.findNear(startedAt!, 30),
        enabled: startedAt !== null,
    });
}