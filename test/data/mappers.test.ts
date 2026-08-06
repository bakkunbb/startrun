import type { Activity } from '@/features/activity/domain/entities/Activity';
import type { Segment } from '@/features/activity/domain/entities/Segment';
import { toEntity, toRow } from '@/features/activity/data/models/ActivityRow';
import {
  groupByKind,
  toSegmentEntity,
  toSegmentRow,
} from '@/features/activity/data/models/SegmentRow';

const seg = (index: number, distanceMeters: number, durationSeconds: number): Segment => ({
  index,
  distanceMeters,
  durationSeconds,
});

const full: Activity = {
  id: 'a1',
  source: 'strava',
  startedAt: new Date(1721783520000),
  distanceMeters: 10240,
  durationSeconds: 3151,
  calories: 642,
  note: '한강 야간 러닝',
  externalId: '9911',
  splitUnitMeters: 1000,
};

const minimal: Activity = {
  id: 'a2',
  source: 'gps',
  startedAt: new Date(0),
  distanceMeters: 5300,
  durationSeconds: 1682,
};

describe('ActivityRow 매핑', () => {
  it('모든 필드가 채워진 기록을 왕복해도 값이 유지된다', () => {
    const back = toEntity(toRow(full));

    expect(back.id).toBe('a1');
    expect(back.source).toBe('strava');
    expect(back.startedAt.getTime()).toBe(1721783520000);
    expect(back.distanceMeters).toBe(10240);
    expect(back.durationSeconds).toBe(3151);
    expect(back.calories).toBe(642);
    expect(back.note).toBe('한강 야간 러닝');
    expect(back.externalId).toBe('9911');
    expect(back.splitUnitMeters).toBe(1000);
  });

  it('Date는 epoch millis로 저장된다', () => {
    expect(toRow(full).started_at).toBe(1721783520000);
  });

  it('undefined는 null로 저장된다', () => {
    const row = toRow(minimal);

    expect(row.calories).toBeNull();
    expect(row.note).toBeNull();
    expect(row.external_id).toBeNull();
    expect(row.split_unit_m).toBeNull();
  });

  it('null은 undefined로 되돌아온다', () => {
    const back = toEntity(toRow(minimal));

    expect(back.calories).toBeUndefined();
    expect(back.note).toBeUndefined();
    expect(back.externalId).toBeUndefined();
    expect(back.splitUnitMeters).toBeUndefined();
  });

  it('구간은 인자로 주입한다', () => {
    const splits = [seg(1, 1000, 312)];
    const laps = [seg(1, 400, 80)];

    const back = toEntity(toRow(full), { splits, laps });
    expect(back.splits).toEqual(splits);
    expect(back.laps).toEqual(laps);
  });

  it('구간을 넘기지 않으면 undefined로 남는다', () => {
    const back = toEntity(toRow(full));

    expect(back.splits).toBeUndefined();
    expect(back.laps).toBeUndefined();
  });
});

describe('SegmentRow 매핑', () => {
  it('왕복해도 값이 유지된다', () => {
    const segment = seg(3, 1000, 298);
    expect(toSegmentEntity(toSegmentRow('a1', 'split', segment))).toEqual(segment);
  });

  it('activity_id와 kind를 함께 넣는다', () => {
    const row = toSegmentRow('abc', 'lap', seg(2, 400, 80));

    expect(row.activity_id).toBe('abc');
    expect(row.kind).toBe('lap');
    expect(row.idx).toBe(2);
    expect(row.distance_m).toBe(400);
    expect(row.duration_s).toBe(80);
  });
});

describe('groupByKind', () => {
  it('kind별로 나누고 idx 순으로 정렬한다', () => {
    const rows = [
      toSegmentRow('a1', 'lap', seg(2, 200, 70)),
      toSegmentRow('a1', 'split', seg(1, 1000, 312)),
      toSegmentRow('a1', 'lap', seg(1, 400, 80)),
    ];

    const { splits, laps } = groupByKind(rows);

    expect(laps.map((s) => s.index)).toEqual([1, 2]);
    expect(splits.map((s) => s.index)).toEqual([1]);
    expect(laps[0]).toEqual(seg(1, 400, 80));
  });

  it('한쪽만 있어도 다른 쪽은 빈 배열이다', () => {
    const rows = [toSegmentRow('a1', 'split', seg(1, 1000, 312))];
    const { splits, laps } = groupByKind(rows);

    expect(splits).toHaveLength(1);
    expect(laps).toEqual([]);
  });

  it('행이 없으면 둘 다 빈 배열이다', () => {
    expect(groupByKind([])).toEqual({ splits: [], laps: [] });
  });
});
