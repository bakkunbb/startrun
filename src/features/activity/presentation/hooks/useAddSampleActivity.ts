import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getContainer } from '@/core/di/container';
import { activityKeys } from './useActivities';

export function useAddSampleActivity() {
    const queryClient = useQueryClient();

    console.log('add called');

    return useMutation({
        mutationFn: async () => {
            const { saveActivity } = await getContainer();
            await saveActivity({
                id: `sample-${Date.now()}`,
                source: 'ai_import',
                startedAt: new Date(),
                distanceMeters: 10240,
                durationSeconds: 3151,
                calories: 642,
                splits: [
                    { index: 1, distanceMeters: 1000, durationSeconds: 312 },
                    { index: 2, distanceMeters: 1000, durationSeconds: 298 },
                ],
                splitUnitMeters: 1000,
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    });
}