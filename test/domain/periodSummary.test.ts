import { startOfWeek, summarize, thisWeek } from '@/features/activity/domain/periodSummary';
import type { Activity } from '@/features/activity/domain/entities/Activity';

const act = (iso: string, distanceMeters: number, durationSeconds: number): Activity => ({
  id: iso,
  source: 'ai_import',
  startedAt: new Date(iso),
  distanceMeters,
  durationSeconds,
});

describe('startOfWeek', () => {
  it('월요일 00:00을 돌려준다', () => {
    // 2026-08-13은 목요일
    expect(startOfWeek(new Date('2026-08-13T15:00:00')).toDateString()).toBe(
      new Date('2026-08-10T00:00:00').toDateString(),
    );
  });

  it('일요일은 그 주의 마지막날이므로 직전 월요일이 된다', () => {
    expect(startOfWeek(new Date('2026-08-16T23:59:00')).toDateString()).toBe(
      new Date('2026-08-10T00:00:00').toDateString(),
    );
  });

  it('월요일 당일이면 그날 00:00', () => {
    const r = startOfWeek(new Date('2026-08-10T00:30:00'));

    expect(r.toDateString()).toBe(new Date('2026-08-10T00:00:00').toDateString());
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
  });
});

describe('thisWeek', () => {
  it('이번 주 기록만 고른다', () => {
    const now = new Date('2026-08-13T12:00:00');
    const all = [
      act('2026-08-12T06:00:00', 10000, 3000), // 수 — 포함
      act('2026-08-10T06:00:00', 5000, 1500), // 월 — 포함
      act('2026-08-09T06:00:00', 8000, 2400), // 일(지난주) — 제외
      act('2026-07-30T06:00:00', 21100, 5203), // 제외
    ];

    expect(thisWeek(all, now).map((a) => a.id)).toEqual([
      '2026-08-12T06:00:00',
      '2026-08-10T06:00:00',
    ]);
  });
});

describe('summarize', () => {
  it('평균 페이스는 전체 시간 ÷ 전체 거리다', () => {
    const r = summarize([act('a', 10000, 3000), act('b', 5000, 1800)]);

    expect(r.count).toBe(2);
    expect(r.totalDistanceMeters).toBe(15000);
    expect(r.totalDurationSeconds).toBe(4800);
    expect(r.avgPaceSecPerKm).toBeCloseTo(320);
    // 활동별 페이스(300, 360)의 산술평균 330과 다르다.
    // 짧은 기록이 긴 기록과 같은 무게를 갖지 않아야 한다.
    expect(r.avgPaceSecPerKm).not.toBeCloseTo(330);
  });

  it('기록이 없으면 0과 null', () => {
    const r = summarize([]);

    expect(r.count).toBe(0);
    expect(r.totalDistanceMeters).toBe(0);
    expect(r.avgPaceSecPerKm).toBeNull();
  });

  it('거리가 0뿐이면 페이스는 null', () => {
    expect(summarize([act('a', 0, 600)]).avgPaceSecPerKm).toBeNull();
  });
});
