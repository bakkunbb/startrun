import { Activity } from "@/features/activity/domain/entities/Activity";
import { ReviewDraft, toActivity } from "../../domain/reviewDraft";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@/core/di/container";
import { activityKeys } from "@/features/activity/presentation/hooks/useActivities";
import { newId } from "@/core/utils/id";

export function useSaveImported(): UseMutationResult<
    Activity, Error, { draft: ReviewDraft; id?: string }
> {
    const queryClient = useQueryClient();
    
    const mutate = useMutation({
        mutationFn: async ({ draft, id }: { draft: ReviewDraft; id?: string}) => {
            const { saveActivity } = await getContainer();
            const activity = toActivity(draft, id ?? newId());
            await saveActivity(activity);
            return activity;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
        }
    });

    return mutate;
}