import { segmentSummary } from '@/features/activity/domain/entities/Segment';
import type { Segment, SegmentView } from '@/features/activity/domain/entities/Segment';

const seg = (index: number, distanceMeters: number, durationSeconds: number): Segment => ({
  index,
  distanceMeters,
  durationSeconds,
});

const splitView = (segments: Segment[], unitMeters = 1000): SegmentView => ({
  kind: 'split',
  segments,
  unitMeters,
});

const lapView = (segments: Segment[]): SegmentView => ({ kind: 'lap', segments });

describe('segmentSummary', () => {
  it('자동 분할의 자투리는 계산에서 뺀다', () => {
    const r = segmentSummary(splitView([seg(1, 1000, 300), seg(2, 1000, 320), seg(3, 240, 60)]))!;

    // 표시용 개수는 3, 계산에 쓴 건 2
    expect(r.count).toBe(3);
    expect(r.measuredCount).toBe(2);
    expect(r.fastestPace).toBeCloseTo(300);
    expect(r.slowestPace).toBeCloseTo(320);
    expect(r.averagePace).toBeCloseTo(310);
    expect(r.spread).toBeCloseTo(20);
  });

  it('랩은 전부 포함한다', () => {
    const r = segmentSummary(lapView([seg(1, 400, 80), seg(2, 200, 70)]))!;

    expect(r.measuredCount).toBe(2);
    expect(r.fastestPace).toBeCloseTo(200); // 400m를 80초
    expect(r.slowestPace).toBeCloseTo(350); // 200m를 70초 (회복 구간)
  });

  it('마지막이 단위를 채웠으면 자투리가 아니므로 포함한다', () => {
    const r = segmentSummary(splitView([seg(1, 1000, 300), seg(2, 1000, 320)]))!;

    expect(r.measuredCount).toBe(2);
  });

  it('구간이 없으면 null', () => {
    expect(segmentSummary(null)).toBeNull();
    expect(segmentSummary(lapView([]))).toBeNull();
  });

  it('페이스를 낼 수 없는 구간뿐이면 null', () => {
    expect(segmentSummary(lapView([seg(1, 0, 60)]))).toBeNull();
  });
});
