import { normalizeSegmentRows } from '@/features/ai-import/domain/normalizeSegments';
import type { RawSegmentRow } from '@/features/ai-import/domain/normalizeSegments';

const row = (index: number, distanceMeters: number, durationSeconds: number): RawSegmentRow => ({
  index,
  distanceMeters,
  durationSeconds,
});

const distances = (r: { rows: RawSegmentRow[] }) => r.rows.map((x) => x.distanceMeters);
const durations = (r: { rows: RawSegmentRow[] }) => r.rows.map((x) => x.durationSeconds);

describe('누적 표기 되돌리기', () => {
  it('누적 거리를 구간별 거리로 바꾼다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 2000, 298), row(3, 3000, 305)], {
      distanceMeters: 3000,
      durationSeconds: 915,
    });

    expect(r.distanceReading).toBe('cumulative');
    expect(r.durationReading).toBe('per_segment');
    expect(distances(r)).toEqual([1000, 1000, 1000]);
    expect(durations(r)).toEqual([312, 298, 305]);
  });

  it('마지막 구간이 1km가 안 돼도 올바르게 나눈다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 2000, 298), row(3, 2240, 70)], {
      distanceMeters: 2240,
      durationSeconds: 680,
    });

    expect(r.distanceReading).toBe('cumulative');
    expect(distances(r)).toEqual([1000, 1000, 240]);
  });

  it('누적 시간도 되돌린다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 1000, 610), row(3, 1000, 915)], {
      distanceMeters: 3000,
      durationSeconds: 915,
    });

    expect(r.durationReading).toBe('cumulative');
    expect(durations(r)).toEqual([312, 298, 305]);
  });
});

describe('구간별 표기는 건드리지 않는다', () => {
  it('같은 거리가 반복되면 구간별이다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 1000, 298)], {
      distanceMeters: 2000,
      durationSeconds: 610,
    });

    expect(r.distanceReading).toBe('per_segment');
    expect(distances(r)).toEqual([1000, 1000]);
  });

  it('거리가 늘어나는 인터벌 랩을 누적으로 오해하지 않는다', () => {
    // 400 → 800 → 1200. 증가하지만 합(2400)이 총거리와 맞으므로 구간별이다
    const r = normalizeSegmentRows([row(1, 400, 80), row(2, 800, 170), row(3, 1200, 260)], {
      distanceMeters: 2400,
      durationSeconds: 510,
    });

    expect(r.distanceReading).toBe('per_segment');
    expect(distances(r)).toEqual([400, 800, 1200]);
  });

  it('초 단위 반올림 오차는 허용 범위로 본다', () => {
    // 각 구간이 초 단위로 반올림되어 합(915)이 총시간(918)과 3초 어긋난다
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 1000, 298), row(3, 1000, 305)], {
      distanceMeters: 3000,
      durationSeconds: 918,
    });

    expect(r.durationReading).toBe('per_segment');
    expect(durations(r)).toEqual([312, 298, 305]);
  });
});

describe('판단할 수 없는 경우', () => {
  it('총합이 없으면 원본을 유지한다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 2000, 610)], {});

    expect(r.distanceReading).toBe('ambiguous');
    expect(r.durationReading).toBe('ambiguous');
    expect(distances(r)).toEqual([1000, 2000]);
  });

  it('어느 해석도 총합과 맞지 않으면 원본을 유지한다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 2000, 298)], {
      distanceMeters: 7777,
      durationSeconds: 610,
    });

    expect(r.distanceReading).toBe('ambiguous');
    expect(distances(r)).toEqual([1000, 2000]);
  });
});

describe('경계', () => {
  it('구간이 하나면 언제나 구간별로 본다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312)], {
      distanceMeters: 1000,
      durationSeconds: 312,
    });

    expect(r.distanceReading).toBe('per_segment');
    expect(distances(r)).toEqual([1000]);
  });

  it('구간이 없으면 빈 배열', () => {
    const r = normalizeSegmentRows([], { distanceMeters: 1000, durationSeconds: 312 });

    expect(r.rows).toEqual([]);
  });

  it('index는 건드리지 않는다', () => {
    const r = normalizeSegmentRows([row(1, 1000, 312), row(2, 2000, 298)], {
      distanceMeters: 2000,
      durationSeconds: 610,
    });

    expect(r.rows.map((x) => x.index)).toEqual([1, 2]);
  });
});
