import {
  paceSecPerKm,
  primarySegments,
  type Activity,
} from '@/features/activity/domain/entities/Activity';
import type { Segment } from '@/features/activity/domain/entities/Segment';

const seg = (index: number, distanceMeters: number, durationSeconds: number): Segment => ({
  index,
  distanceMeters,
  durationSeconds,
});

const activity = (over: Partial<Activity> = {}): Activity => ({
  id: 'a1',
  source: 'ai_import',
  startedAt: new Date('2026-07-24T06:12:00Z'),
  distanceMeters: 10240,
  durationSeconds: 3151,
  ...over,
});

describe('paceSecPerKm', () => {
  it('10km를 50분에 뛰면 300초/km', () => {
    expect(paceSecPerKm(activity({ distanceMeters: 10000, durationSeconds: 3000 }))).toBeCloseTo(300);
  });

  it('10.24km / 52분 31초 → 약 5분 08초', () => {
    expect(Math.round(paceSecPerKm(activity())!)).toBe(308);
  });

  it('거리가 0이면 null', () => {
    expect(paceSecPerKm(activity({ distanceMeters: 0 }))).toBeNull();
  });

  it('거리가 음수여도 null', () => {
    expect(paceSecPerKm(activity({ distanceMeters: -100 }))).toBeNull();
  });
});

describe('primarySegments', () => {
  const laps = [seg(1, 400, 80), seg(2, 200, 70)];
  const splits = [seg(1, 1000, 312), seg(2, 1000, 298)];

  it('랩이 있으면 랩을 우선한다', () => {
    const view = primarySegments(activity({ laps, splits, splitUnitMeters: 1000 }));

    expect(view?.kind).toBe('lap');
    expect(view?.segments).toEqual(laps);
  });

  it('랩이 없으면 자동 분할을 쓴다', () => {
    const view = primarySegments(activity({ splits, splitUnitMeters: 1000 }));

    expect(view?.kind).toBe('split');
    expect(view?.segments).toEqual(splits);
  });

  it('랩 배열이 비어 있으면 자동 분할로 넘어간다', () => {
    const view = primarySegments(activity({ laps: [], splits, splitUnitMeters: 1000 }));
    expect(view?.kind).toBe('split');
  });

  it('구간이 아예 없으면 null', () => {
    expect(primarySegments(activity())).toBeNull();
  });

  it('자동 분할인데 단위를 모르면 뷰를 만들 수 없다', () => {
    expect(primarySegments(activity({ splits }))).toBeNull();
  });

  it('자동 분할 뷰는 단위를 함께 넘긴다', () => {
    const view = primarySegments(activity({ splits, splitUnitMeters: 1609.34 }));

    expect(view).toEqual({ kind: 'split', segments: splits, unitMeters: 1609.34 });
  });
});
