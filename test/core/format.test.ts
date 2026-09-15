import {
  formatBucketLabel,
  formatPeriodLabel,
  formatYearMonth,
} from '@/core/utils/format';
import { periodOf, shiftPeriod } from '@/features/activity/domain/period';

/** 2026-08-13은 목요일. 그 주는 8/10(월) ~ 8/16(일) */
const NOW = new Date('2026-08-13T12:00:00');

describe('formatYearMonth', () => {
  it('연도와 월을 쓴다', () => {
    expect(formatYearMonth(new Date('2026-08-01'))).toBe('2026년 8월');
    expect(formatYearMonth(new Date('2025-12-01'))).toBe('2025년 12월');
  });
});

describe('formatBucketLabel', () => {
  it('주간은 요일 한 글자', () => {
    expect(formatBucketLabel(new Date('2026-08-10'), 'week')).toBe('월');
    expect(formatBucketLabel(new Date('2026-08-16'), 'week')).toBe('일');
  });

  it('월간은 주 시작일', () => {
    expect(formatBucketLabel(new Date('2026-07-27'), 'month')).toBe('7/27');
    expect(formatBucketLabel(new Date('2026-08-03'), 'month')).toBe('8/3');
  });
});

describe('formatPeriodLabel', () => {
  it('현재 구간은 이번 주 · 이번 달', () => {
    expect(formatPeriodLabel(periodOf(NOW, 'week'), NOW)).toBe('이번 주');
    expect(formatPeriodLabel(periodOf(NOW, 'month'), NOW)).toBe('이번 달');
  });

  it('지난 주는 날짜 범위로 쓴다', () => {
    const p = shiftPeriod(periodOf(NOW, 'week'), -1); // 8/3 ~ 8/9

    expect(formatPeriodLabel(p, NOW)).toBe('8월 3일 – 8월 9일');
  });

  it('마지막 날은 end의 하루 전이다', () => {
    // end는 열린 경계(8/3)이므로 표시는 8/2여야 한다
    const p = shiftPeriod(periodOf(NOW, 'week'), -2); // 7/27 ~ 8/2

    expect(formatPeriodLabel(p, NOW)).toBe('7월 27일 – 8월 2일');
  });

  it('다른 해의 주에는 연도를 한 번 붙인다', () => {
    const p = periodOf(new Date('2025-12-30'), 'week'); // 2025/12/29 ~ 2026/1/4

    expect(formatPeriodLabel(p, NOW)).toBe('2025년 12월 29일 – 1월 4일');
  });

  it('지난 달은 연월로 쓴다', () => {
    expect(formatPeriodLabel(shiftPeriod(periodOf(NOW, 'month'), -1), NOW)).toBe('2026년 7월');
  });
});