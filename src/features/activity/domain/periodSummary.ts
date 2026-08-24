import { Activity } from "./entities/Activity";

export type PeriodSummary = {
    count: number;
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    avgPaceSecPerKm: number | null;
};

export function startOfWeek(now: Date): Date {
    const day = now.getDay();
    
    if(day === 0) {
        now.setDate(now.getDate() - 6);
    } else {
        now.setDate(now.getDate() - day + 1);
    }

    now.setHours(0);
    now.setMinutes(0);

    return now;
}

export function thisWeek(activities: Activity[], now?: Date): Activity[] {
    let filtered: Activity[] = [];
    const start = startOfWeek(now ?? new Date());
    let end = new Date(start);
    end.setDate(start.getDate() + 6);

    activities.map((activity) => {
        const activityDate = activity.startedAt;
        if(activityDate >= start && activityDate < end) {
            filtered.push(activity);
        }
    });

    return filtered;
}

export function summarize(activities: Activity[]): PeriodSummary {
    const count = activities.length;
    const totalDistanceMeters = activities.reduce((a, b) => a + b.distanceMeters, 0);
    const totalDurationSeconds = activities.reduce((a, b) => a + b.durationSeconds, 0);
    
    const avgPaceSecPerKm = totalDistanceMeters !== 0 && count !== 0
        ? totalDurationSeconds / totalDistanceMeters * 1000
        : null;
    
    return {
        count: count,
        totalDistanceMeters: totalDistanceMeters,
        totalDurationSeconds: totalDurationSeconds,
        avgPaceSecPerKm: avgPaceSecPerKm
    };
}