import {
  fastestSegment,
  inferSegmentKind,
  isRemainder,
  segmentPaceSecPerKm,
  type Segment,
  type SegmentView,
} from '@/features/activity/domain/entities/Segment';

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

describe('segmentPaceSecPerKm', () => {
  it('1km를 5분 12초에 뛰면 312초/km', () => {
    expect(segmentPaceSecPerKm(seg(1, 1000, 312))).toBeCloseTo(312);
  });

  it('400m를 80초에 뛰면 200초/km', () => {
    expect(segmentPaceSecPerKm(seg(1, 400, 80))).toBeCloseTo(200);
  });

  it('거리가 0이면 null', () => {
    expect(segmentPaceSecPerKm(seg(1, 0, 100))).toBeNull();
  });
});

describe('isRemainder', () => {
  it('자동 분할의 마지막 짧은 구간은 자투리다', () => {
    const view = splitView([seg(1, 1000, 312), seg(2, 1000, 298), seg(3, 240, 78)]);
    expect(isRemainder(view, 3)).toBe(true);
  });

  it('마지막이 아니면 자투리가 아니다', () => {
    const view = splitView([seg(1, 1000, 312), seg(2, 1000, 298), seg(3, 240, 78)]);
    expect(isRemainder(view, 1)).toBe(false);
    expect(isRemainder(view, 2)).toBe(false);
  });

  it('마지막이라도 단위 길이를 채웠으면 자투리가 아니다', () => {
    const view = splitView([seg(1, 1000, 312), seg(2, 1000, 298)]);
    expect(isRemainder(view, 2)).toBe(false);
  });

  it('랩에는 자투리 개념이 없다', () => {
    const view = lapView([seg(1, 400, 80), seg(2, 200, 70)]);
    expect(isRemainder(view, 2)).toBe(false);
  });
});

describe('fastestSegment', () => {
  it('자동 분할에서는 자투리를 제외한다', () => {
    // 3번 구간이 페이스는 가장 빠르지만(229초/km) 자투리이므로 제외
    const view = splitView([seg(1, 1000, 312), seg(2, 1000, 298), seg(3, 240, 55)]);
    expect(fastestSegment(view)?.index).toBe(2);
  });

  it('랩은 모든 구간을 포함한다', () => {
    // 200/km, 350/km(회복 랩), 195/km
    const view = lapView([seg(1, 400, 80), seg(2, 200, 70), seg(3, 400, 78)]);
    expect(fastestSegment(view)?.index).toBe(3);
  });

  it('구간이 없으면 null', () => {
    expect(fastestSegment(lapView([]))).toBeNull();
  });

  it('자투리 하나뿐이면 null', () => {
    expect(fastestSegment(splitView([seg(1, 240, 55)]))).toBeNull();
  });
});

describe('inferSegmentKind', () => {
  it('1km 균일이면 자동 분할로 본다', () => {
    const segments = [seg(1, 1000, 312), seg(2, 1005, 298), seg(3, 240, 78)];
    expect(inferSegmentKind(segments)).toEqual({ kind: 'split', unitMeters: 1000 });
  });

  it('마일 단위도 인식한다', () => {
    const segments = [seg(1, 1609.34, 500), seg(2, 1609.34, 495), seg(3, 1020, 320)];
    expect(inferSegmentKind(segments)).toEqual({ kind: 'split', unitMeters: 1609.34 });
  });

  it('거리가 제각각이면 랩으로 본다', () => {
    const segments = [seg(1, 400, 80), seg(2, 200, 70), seg(3, 400, 78)];
    expect(inferSegmentKind(segments)).toEqual({ kind: 'lap' });
  });

  it('균일하지만 알려진 단위가 아니면 판단하지 않는다', () => {
    const segments = [seg(1, 500, 150), seg(2, 500, 148), seg(3, 500, 151)];
    expect(inferSegmentKind(segments)).toEqual({ kind: 'unknown' });
  });

  it('구간이 1개뿐이면 근거가 부족하다', () => {
    expect(inferSegmentKind([seg(1, 1000, 312)])).toEqual({ kind: 'unknown' });
  });

  it('구간이 없으면 판단하지 않는다', () => {
    expect(inferSegmentKind([])).toEqual({ kind: 'unknown' });
  });

  it('마지막 구간은 균일성 판단에서 제외한다', () => {
    // 마지막이 240m라도 앞이 균일하면 자동 분할
    const segments = [seg(1, 1000, 312), seg(2, 1000, 298), seg(3, 240, 78)];
    expect(inferSegmentKind(segments)).toEqual({ kind: 'split', unitMeters: 1000 });
  });

  it('허용 오차를 조절할 수 있다', () => {
    const segments = [seg(1, 1000, 312), seg(2, 1060, 298), seg(3, 240, 78)];
    expect(inferSegmentKind(segments, 30)).toEqual({ kind: 'lap' });
    expect(inferSegmentKind(segments, 100)).toEqual({ kind: 'split', unitMeters: 1000 });
  });
});
