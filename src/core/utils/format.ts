import { Period, PeriodUnit } from "@/features/activity/domain/period";

export function formatDistanceKm(meters: number): string {
    return (meters / 1000).toFixed(2);
}

export function formatPace(secPerKm: number | null | undefined): string {
    if (secPerKm === null || secPerKm === undefined) return '-';
    if (secPerKm <= 0 || !Number.isFinite(secPerKm)) return '-';

    const minutes = Math.floor(secPerKm / 60);
    const seconds = Math.floor(secPerKm % 60);

    return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

/** 초 → "52:31", 1시간 이상이면 "1:01:01", 초에 소수점이 있으면 "52:31.7" */
export function formatDuration(seconds: number, forTable: boolean = false): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const [whole, decimal] = s.toFixed(1).split('.');
    const secString = !forTable ? whole.padStart(2, '0') : `${whole.padStart(2, '0')}.${decimal}`;

    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${secString}`;
    }

    return `${m}:${secString}`;
}

/** Date → "7월 24일" (기기 시간대 기준) */
export function formatMonthDay(d: Date): string {
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatDatetime(d: Date): string {
    const week: string[] = ['일', '월', '화', '수', '목', '금', '토'];

    // 숫자에 맞는 배열 인덱스 값 가져오기
    const dayLabel: string = week[d.getDay()];

    return `${d.getMonth() + 1}월 ${padNumber(d.getDate())}일 (${dayLabel}) ${padNumber(d.getHours())} : ${padNumber(d.getMinutes())}`;
}

export function padNumber(num: number): string {
    return num.toString().padStart(2, '0');
}

/** '2026년 8월' */
export function formatYearMonth(date: Date): string {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

/** 그래프 막대 아래 라벨. 주간=요일 한 글자, 월간=주 시작일 */
export function formatBucketLabel(start: Date, unit: PeriodUnit): string {
    if(unit === 'week') {
        const week: string[] = ['일', '월', '화', '수', '목', '금', '토'];

        return week[start.getDay()];
    } else {
        return `${start.getMonth() + 1}/${start.getDate()}`;
    }
}

/** 기간 헤더 라벨 */
export function formatPeriodLabel(period: Period, now?: Date): string {
    now = now ?? new Date();
    if(now.getTime() >= period.start.getTime() && now.getTime() < period.end.getTime()) {
        return period.unit === 'week' ? '이번 주' : '이번 달';
    }
    
    const endDate = new Date(period.end);
    endDate.setDate(endDate.getDate()-1);
    
    if(period.unit === 'week') {
        const isSameYear = period.start.getFullYear() !== endDate.getFullYear();
        return `${isSameYear ? period.start.getFullYear()+'년 ' : ''}${formatMonthDay(period.start)} – ${formatMonthDay(endDate)}`;
    } else {
        return `${formatYearMonth(period.start)}`;
    }
}