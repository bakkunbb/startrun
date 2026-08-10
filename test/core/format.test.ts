import {
  formatDistanceKm,
  formatDuration,
  formatMonthDay,
  formatPace,
} from '@/core/utils/format';

describe('formatDistanceKm', () => {
  it('미터를 km 두 자리로 바꾼다', () => {
    expect(formatDistanceKm(10240)).toBe('10.24');
  });

  it('끝자리 0을 유지한다', () => {
    expect(formatDistanceKm(5300)).toBe('5.30');
  });

  it('0도 형식을 지킨다', () => {
    expect(formatDistanceKm(0)).toBe('0.00');
  });

  it('세 자리 아래는 반올림한다', () => {
    expect(formatDistanceKm(999)).toBe('1.00');
    // 부동소수점 특성: 1.005는 2진수로 정확히 표현되지 않아 '1.00'이 된다
    expect(formatDistanceKm(1005)).toBe('1.00');
    expect(formatDistanceKm(1006)).toBe('1.01');
  });
});

describe('formatPace', () => {
  it('초/km를 분초 표기로 바꾼다', () => {
    expect(formatPace(308)).toBe('5\'08"');
    expect(formatPace(300)).toBe('5\'00"');
  });

  it('10분대도 자리수가 깨지지 않는다', () => {
    expect(formatPace(605)).toBe('10\'05"');
  });

  it('소수는 반올림한다', () => {
    expect(formatPace(312.4)).toBe('5\'12"');
  });

  it('값이 없거나 계산 불가면 하이픈', () => {
    expect(formatPace(null)).toBe('-');
    expect(formatPace(undefined)).toBe('-');
    expect(formatPace(0)).toBe('-');
    expect(formatPace(Infinity)).toBe('-');
  });
});

describe('formatDuration', () => {
  it('한 시간 미만은 분:초', () => {
    expect(formatDuration(3151)).toBe('52:31');
    expect(formatDuration(600)).toBe('10:00');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('한 시간 이상은 시:분:초', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});

describe('formatMonthDay', () => {
  it('월 일 형식으로 바꾼다', () => {
    // 로컬 시간으로 생성해야 시간대와 무관하게 같은 결과가 나온다
    expect(formatMonthDay(new Date(2026, 6, 24))).toBe('7월 24일');
    expect(formatMonthDay(new Date(2026, 0, 1))).toBe('1월 1일');
    expect(formatMonthDay(new Date(2026, 11, 31))).toBe('12월 31일');
  });
});
