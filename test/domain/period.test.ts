import {
  activitiesIn,
  canGoNext,
  changeUnit,
  groupByMonth,
  isCurrentPeriod,
  periodOf,
  shiftPeriod,
  startOfMonth,
  startOfWeek,
  subBuckets,
  summarize,
} from '@/features/activity/domain/period';
import type { Activity } from '@/features/activity/domain/entities/Activity';

const act = (iso: string, distanceMeters: number, durationSeconds = 600): Activity => ({
  id: iso,
  source: 'ai_import',
  startedAt: new Date(iso),
  distanceMeters,
  durationSeconds,
});

/** 2026-08-13은 목요일. 그 주는 8/10(월) ~ 8/16(일) */
const NOW = new Date('2026-08-13T12:00:00');

describe('구간 시작', () => {
  it('startOfWeek는 월요일 00:00', () => {
    expect(startOfWeek(NOW).toDateString()).toBe(new Date('2026-08-10').toDateString());
  });

  it('일요일은 그 주의 마지막날이므로 직전 월요일', () => {
    expect(startOfWeek(new Date('2026-08-16T23:59:00')).toDateString()).toBe(
      new Date('2026-08-10').toDateString(),
    );
  });

  it('startOfMonth는 1일 00:00', () => {
    const r = startOfMonth(NOW);

    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(7);
    expect(r.getHours()).toBe(0);
  });
});

describe('periodOf', () => {
  it('주간은 월요일부터 다음 월요일까지', () => {
    const p = periodOf(NOW, 'week');

    expect(p.start.toDateString()).toBe(new Date('2026-08-10').toDateString());
    expect(p.end.toDateString()).toBe(new Date('2026-08-17').toDateString());
  });

  it('월간은 1일부터 다음 달 1일까지', () => {
    const p = periodOf(NOW, 'month');

    expect(p.start.getDate()).toBe(1);
    expect(p.start.getMonth()).toBe(7);
    expect(p.end.getMonth()).toBe(8);
    expect(p.end.getDate()).toBe(1);
  });
});

describe('이동', () => {
  it('주 단위로 앞뒤로 옮긴다', () => {
    const p = periodOf(NOW, 'week');

    expect(shiftPeriod(p, -1).start.toDateString()).toBe(new Date('2026-08-03').toDateString());
    expect(shiftPeriod(p, 2).start.toDateString()).toBe(new Date('2026-08-24').toDateString());
  });

  it('월 이동은 연도 경계를 넘는다', () => {
    const jan = periodOf(new Date('2026-01-15'), 'month');
    const dec = shiftPeriod(jan, -1);

    expect(dec.start.getFullYear()).toBe(2025);
    expect(dec.start.getMonth()).toBe(11);
  });

  it('단위를 바꿔도 보고 있던 시점을 유지한다', () => {
    const week = periodOf(NOW, 'week'); // 8/10~8/17
    const month = changeUnit(week, 'month');

    expect(month.start.getMonth()).toBe(7); // 8월

    // 다시 주간으로 돌리면 그 달 1일이 속한 주
    expect(changeUnit(month, 'week').start.toDateString()).toBe(
      new Date('2026-07-27').toDateString(),
    );
  });

  it('다음 구간이 미래면 이동할 수 없다', () => {
    const current = periodOf(NOW, 'week');

    expect(canGoNext(current, NOW)).toBe(false);
    expect(canGoNext(shiftPeriod(current, -1), NOW)).toBe(true);
  });

  it('현재 구간을 알아본다', () => {
    expect(isCurrentPeriod(periodOf(NOW, 'week'), NOW)).toBe(true);
    expect(isCurrentPeriod(shiftPeriod(periodOf(NOW, 'week'), -1), NOW)).toBe(false);
  });
});

describe('activitiesIn', () => {
  it('시작은 포함하고 끝은 포함하지 않는다', () => {
    const p = periodOf(NOW, 'week'); // 8/10 00:00 ~ 8/17 00:00
    const all = [
      act('2026-08-10T00:00:00', 1000), // 시작 정각 — 포함
      act('2026-08-16T23:59:59', 2000), // 마지막 순간 — 포함
      act('2026-08-17T00:00:00', 3000), // 끝 정각 — 제외
      act('2026-08-09T23:59:59', 4000), // 직전 — 제외
    ];

    expect(activitiesIn(all, p).map((a) => a.distanceMeters)).toEqual([1000, 2000]);
  });
});

describe('summarize', () => {
  it('평균 페이스는 총시간 ÷ 총거리다', () => {
    const r = summarize([act('a', 10000, 3000), act('b', 5000, 1800)]);

    expect(r.totalDistanceMeters).toBe(15000);
    expect(r.avgPaceSecPerKm).toBeCloseTo(320);
    // 활동별 페이스(300, 360)의 산술평균 330과 다르다
    expect(r.avgPaceSecPerKm).not.toBeCloseTo(330);
  });

  it('기록이 없으면 페이스는 null', () => {
    expect(summarize([]).avgPaceSecPerKm).toBeNull();
  });
});

describe('subBuckets', () => {
  it('주간은 7일로 나눈다', () => {
    const p = periodOf(NOW, 'week');
    const all = [
      act('2026-08-10T06:00:00', 5000),
      act('2026-08-10T18:00:00', 3000), // 같은 날 두 번
      act('2026-08-15T07:00:00', 10000),
    ];

    const b = subBuckets(all, p);

    expect(b).toHaveLength(7);
    expect(b.map((x) => x.distanceMeters)).toEqual([8000, 0, 0, 0, 0, 10000, 0]);
    expect(b.map((x) => x.count)).toEqual([2, 0, 0, 0, 0, 1, 0]);
  });

  it('월간은 주 단위로 나누고 달 전체를 덮는다', () => {
    const p = periodOf(new Date('2026-08-13'), 'month'); // 8/1 ~ 9/1
    const b = subBuckets([], p);

    // 8/1(토)이 속한 주는 7/27 시작 → 7/27 · 8/3 · 8/10 · 8/17 · 8/24 · 8/31
    expect(b).toHaveLength(6);
    expect(b[0].start.toDateString()).toBe(new Date('2026-07-27').toDateString());
    expect(b[b.length - 1].start.getTime()).toBeLessThan(p.end.getTime());
  });

  it('기록이 없어도 구간 개수는 유지한다', () => {
    // 빈 배열을 주면 그래프 축이 사라져 쉬었던 날이 보이지 않는다
    const b = subBuckets([], periodOf(NOW, 'week'));

    expect(b).toHaveLength(7);
    expect(b.map((x) => x.distanceMeters)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('groupByMonth', () => {
  it('달별로 묶고 최신 달을 먼저 둔다', () => {
    const all = [
      act('2026-08-12T06:00:00', 10000, 3000),
      act('2026-07-28T06:00:00', 21100, 5203),
      act('2026-08-01T06:00:00', 5000, 1500),
    ];

    const g = groupByMonth(all);

    expect(g).toHaveLength(2);
    expect(g[0].start.getMonth()).toBe(7); // 8월
    expect(g[1].start.getMonth()).toBe(6); // 7월
    expect(g[0].data).toHaveLength(2);
  });

  it('섹션 안도 최신순이다', () => {
    const g = groupByMonth([act('2026-08-01T06:00:00', 5000), act('2026-08-12T06:00:00', 10000)]);

    expect(g[0].data.map((a) => a.id)).toEqual(['2026-08-12T06:00:00', '2026-08-01T06:00:00']);
  });

  it('섹션마다 집계를 함께 준다', () => {
    const g = groupByMonth([
      act('2026-08-01T06:00:00', 10000, 3000),
      act('2026-08-12T06:00:00', 5000, 1800),
    ]);

    expect(g[0].summary.count).toBe(2);
    expect(g[0].summary.totalDistanceMeters).toBe(15000);
    expect(g[0].summary.avgPaceSecPerKm).toBeCloseTo(320);
  });

  it('기록이 없는 달은 섹션을 만들지 않는다', () => {
    // 그래프의 subBuckets와 반대다. 목록에서 빈 달을 보여줄 이유가 없다
    const g = groupByMonth([act('2026-08-12T06:00:00', 10000), act('2026-06-03T06:00:00', 5000)]);

    expect(g).toHaveLength(2);
    expect(g.map((s) => s.start.getMonth())).toEqual([7, 5]);
  });

  it('연도 경계를 넘어도 순서가 맞다', () => {
    const g = groupByMonth([act('2025-12-20T06:00:00', 5000), act('2026-01-05T06:00:00', 8000)]);

    expect(g.map((s) => [s.start.getFullYear(), s.start.getMonth()])).toEqual([
      [2026, 0],
      [2025, 11],
    ]);
  });

  it('빈 배열이면 빈 섹션 목록', () => {
    expect(groupByMonth([])).toEqual([]);
  });
});