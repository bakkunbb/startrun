import { getContainer } from "@/core/di/container";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "../../domain/entities/Activity";

export const activityKeys = {
    all: ['activities'] as const,
    detail: (id: string) => ['activities', id] as const,
};

export function useActivities() {
    return useQuery<Activity[]>({
        queryKey: activityKeys.all,
        queryFn: async () => {
            const { activityRepository } = await getContainer();
            return activityRepository.getAll();
        }
    })
}