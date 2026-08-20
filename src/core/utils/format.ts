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
    // const secString = decimal === '0' ? whole.padStart(2, '0') : `${whole.padStart(2, '0')}.${decimal}`;
    const secString = !forTable ? whole.padStart(2, '0') : `${whole.padStart(2, '0')}.${decimal}`;
    // const secString =  `${whole.padStart(2, '0')}.${decimal === undefined ? '0': decimal}`;

    if (h > 0) {
        // return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${h}:${String(m).padStart(2, '0')}:${secString}`;
    }

    // return `${m}:${String(s).padStart(2, '0')}`;
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

    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayLabel}) ${d.getHours()} : ${d.getMinutes()}`;
}