/** 10.24 =-> 10240. 형식이 아니면 null */
export function parseDistanceKm(input: string): number | null {
    const result = input.trim().replaceAll(",", ".");
    const decimalRegex: RegExp = /^\d+(\.\d{1,2})?$/;
    
    if (decimalRegex.test(result)) {
        const distance = parseFloat(result);
        return isNaN(distance) || distance < 0 ? null : distance * 1000;
    } else {
        return null;
    }
}

/** '52:31' → 3151, '1:02:03' → 3723, '90' → 90. 형식이 아니면 null */
export function parseDuration(input: string): number | null {
    const timeFormatRegex: RegExp = /(?<!\S)(?:(?:(\d{1,2}):)?([0-5]?\d):([0-5]?\d)|(\d+))(?!\S)/;
    
    const d = input.trim().replaceAll('\'', ':').replace(/\..*/, '');
    if (!timeFormatRegex.test(d)) return null;
    
    const parts = d.split(':');

    if(parts.length > 3) return null;

    const nums = parts.map((v) => parseInt(v, 10));
    return nums.reverse().reduce((a, b, i) => a + (i === 0 ? b : (b * Math.pow(60, i))), 0);
}

/** '642' → 642. 빈 문자열은 값 없음이므로 undefined, 형식 오류는 null */
export function parsePureNum(input: string): number | undefined | null {
    if (input.trim() === '') return undefined;
    const calories = Number.parseInt(input, 10);
    return Number.isFinite(calories) && calories >= 0 ? calories : null;
}