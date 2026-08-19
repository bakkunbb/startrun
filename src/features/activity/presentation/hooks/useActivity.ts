import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Activity } from "../../domain/entities/Activity";
import { getContainer } from "@/core/di/container";
import { activityKeys } from "./activityKeys";

export function useActivity(id: string): UseQueryResult<Activity | null> {
    return useQuery({
        queryKey: activityKeys.detail(id),
        queryFn: async () => (await getContainer()).activityRepository.getById(id)
    })
}