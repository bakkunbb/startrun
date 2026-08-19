import { getContainer } from "@/core/di/container";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "../../domain/entities/Activity";
import { activityKeys } from "./activityKeys";

export function useActivities() {
    return useQuery<Activity[]>({
        queryKey: activityKeys.all,
        queryFn: async () => {
            const { activityRepository } = await getContainer();
            return activityRepository.getAll();
        }
    })
}