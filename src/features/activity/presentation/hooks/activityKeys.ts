export const activityKeys = {
    all: ['activities'] as const,
    lists: () => [...activityKeys.all, 'list'] as const,
    detail: (id: string) => [...activityKeys.all, 'detail', id] as const
};