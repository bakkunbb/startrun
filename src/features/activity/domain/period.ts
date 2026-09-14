import { Activity } from "./entities/Activity";

export type PeriodUnit = 'week' | 'month';

export type Period = {
    unit: PeriodUnit;
    start: Date;
    end: Date;
};

export function startOfWeek(now: Date): Date {
    const d = new Date(now);
    const day = d.getDay();
    
    if(day === 0) {
        d.setDate(d.getDate() - 6);
    } else {
        d.setDate(d.getDate() - day + 1);
    }

    d.setHours(0,0,0,0);

    return d;
}

export function startOfMonth(now: Date): Date {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0,0,0,0);

    return d;
}

/** date가 속한 구간 */
export function periodOf(date: Date, unit: PeriodUnit): Period {
    if(unit === 'week') {
        const start = startOfWeek(date);
        const end = new Date(start)
        end.setDate(start.getDate() + 7);

        return {
            unit: unit,
            start: start,
            end: end,
        };
    } else {
        const start = startOfMonth(date);
        const end = new Date(start);
        end.setMonth(start.getMonth()+1);

        return {
            unit: unit,
            start: start,
            end: end
        }
    }
}

// /** delta만큼 앞뒤로 이동 */
export function shiftPeriod(period: Period, delta: number): Period {
    const standard = period.start;

    if(period.unit === 'week') {
        const start = new Date(standard);
        start.setDate(standard.getDate() + (delta * 7));

        return periodOf(start, 'week');
    } else {
        const start = new Date(standard);
        start.setMonth(start.getMonth() + delta);

        return periodOf(start, 'month');
    }
}

/** 단위를 바꾸되 보고 있던 시점은 유지 */
export function changeUnit(period: Period, unit: PeriodUnit): Period {
    if(period.unit === unit) return period;

    if(unit === 'week') {
        return periodOf(startOfWeek(period.start), unit);
    } else {
        return periodOf(startOfMonth(period.start), unit);
    }
}

export function isCurrentPeriod(period: Period, now?: Date): boolean {
    const standard = now ?? new Date();

    let start;

    if(period.unit === 'week') {
        start = startOfWeek(standard);
    } else {
        start = startOfMonth(standard);
    }

    return start.getTime() === period.start.getTime();
}

/** 다음 구간이 미래면 false */
export function canGoNext(period: Period, now?: Date): boolean {
    const standard = now ?? new Date();

    if(isCurrentPeriod(period, standard)) return false;

    return period.start < periodOf(shiftPeriod(period, 1).start, period.unit).start;
}

export function activitiesIn(activities: Activity[], period: Period): Activity[] {
    const result = activities.filter((act) => periodOf(act.startedAt, period.unit).start.getTime() === period.start.getTime());
    return result;
}

export type PeriodSummary = {
    count: number;
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    avgPaceSecPerKm: number | null;
};

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

export type SubBucket = {
    start: Date;
    distanceMeters: number;
    count: number;
};

/** 구간 내부를 잘게 나눈다. 주간=7일, 월간=주 단위 */
export function subBuckets(activities: Activity[], period: Period): SubBucket[] {
    let buckets: SubBucket[] = [];
    
    if(period.unit === 'week') {
        const filtered = activities.filter((activity) => activity.startedAt.getTime() >= period.start.getTime() && activity.startedAt.getTime() < period.end.getTime());
        for(let i = 0; i < 7; i++) {
            const startDate = new Date(period.start);
            startDate.setDate(period.start.getDate() + i);

            let distanceMeter = 0;
            let count = 0;

            filtered.map((act) => {
                if(act.startedAt.toDateString() === startDate.toDateString()) {
                    distanceMeter += act.distanceMeters;
                    count += 1;
                }
            });

            buckets.push({
                start: new Date(startDate),
                distanceMeters: distanceMeter,
                count: count
            });
        }
    
    } else {
        const firstMonthDay = startOfMonth(period.start);
        const lastMonthDay = new Date(firstMonthDay);
        lastMonthDay.setMonth(firstMonthDay.getMonth() + 1);
        lastMonthDay.setDate(firstMonthDay.getDate() - 1);
        const firstWeekStartDay = startOfWeek(firstMonthDay);
        const lastWeekStartDay = startOfWeek(lastMonthDay);

        const filtered = activities.filter((activity) => activity.startedAt.getTime() >= firstMonthDay.getTime() && activity.startedAt.getTime() < period.end.getTime());

        const startDate = new Date(firstWeekStartDay);
        
        while(startDate.getTime() <= lastWeekStartDay.getTime()) {
            let distanceMeter = 0;
            let count = 0;

            filtered.map((act) => {
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7)

                if(act.startedAt.getTime() >= startDate.getTime() && act.startedAt.getTime() < endDate.getTime()) {
                    distanceMeter += act.distanceMeters;
                    count += 1;
                }
            });

            buckets.push({
                start: new Date(startDate),
                distanceMeters: distanceMeter,
                count: count,
            })

            startDate.setDate(startDate.getDate() + 7);
        }
    }
    
    return buckets;
}

/** SectionList에 그대로 넘길 수 있는 모양 */
export type MonthSection = {
    start: Date;
    summary: PeriodSummary;
    data: Activity[]
};

/** 달별로 묶는다. 최신 달이 먼저, 기록 없는 달은 만들지 않는다 */
export function groupByMonth(activities: Activity[]): MonthSection[] {
    const result: MonthSection[] = [];

    const groups = groupActivitiesByMonth(activities);
    const sorted = Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);

    for(const acts of sorted) {
        const start = new Date(acts[0]);
        const sortedActivities = Array.from(acts[1]).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
        
        result.push({
            start: start,
            summary: summarize(sortedActivities),
            data: sortedActivities
        });
    }

    return result;
}

function groupActivitiesByMonth(activities: Activity[]): Map<number, Activity[]> {
    const groups = new Map<number, Activity[]>();

    for (const act of activities) {
        const key = startOfMonth(act.startedAt).getTime();
        const list = groups.get(key) ?? [];
        list.push(act);
        groups.set(key, list);
    }

    return groups;
}