import { toExtractedActivity } from '@/features/ai-import/domain/toExtractedActivity';
import type { ExtractionDto } from '@/features/ai-import/data/models/ExtractionDto';
import type { RawSegmentRow } from '@/features/ai-import/domain/normalizeSegments';

const row = (index: number, distanceMeters: number, durationSeconds: number): RawSegmentRow => ({
  index,
  distanceMeters,
  durationSeconds,
});

const dto = (over: Partial<ExtractionDto> = {}): ExtractionDto => ({
  startedAtIso: '2026-07-24T06:12:00',
  distanceMeters: 10240,
  durationSeconds: 3151,
  calories: 642,
  segmentSets: [],
  lowConfidenceFields: [],
  ...over,
});

describe('요약 필드', () => {
  it('있는 값을 그대로 옮긴다', () => {
    const r = toExtractedActivity(dto());

    expect(r.distanceMeters).toBe(10240);
    expect(r.durationSeconds).toBe(3151);
    expect(r.calories).toBe(642);
    expect(r.startedAt!.getFullYear()).toBe(2026);
    expect(r.warnings).toEqual([]);
  });

  it('null 칼로리는 undefined가 된다', () => {
    expect(toExtractedActivity(dto({ calories: null })).calories).toBeUndefined();
  });

  it('lowConfidenceFields는 그대로 전달한다', () => {
    expect(toExtractedActivity(dto({ lowConfidenceFields: ['calories'] })).lowConfidenceFields).toEqual([
      'calories',
    ]);
  });
});

describe('경고', () => {
  it('날짜가 없으면 missing_started_at', () => {
    const r = toExtractedActivity(dto({ startedAtIso: null }));

    expect(r.startedAt).toBeNull();
    expect(r.warnings).toContain('missing_started_at');
  });

  it('날짜를 Date로 만들 수 없으면 invalid_started_at', () => {
    const r = toExtractedActivity(dto({ startedAtIso: '어제 저녁' }));

    expect(r.startedAt).toBeNull();
    expect(r.warnings).toContain('invalid_started_at');
  });

  it('거리와 시간이 없으면 각각 경고한다', () => {
    const r = toExtractedActivity(dto({ distanceMeters: null, durationSeconds: null }));

    expect(r.warnings).toContain('missing_distance');
    expect(r.warnings).toContain('missing_duration');
  });

  it('구간 합이 총거리와 어긋나면 경고하되 구간은 버리지 않는다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 10000,
        durationSeconds: 3000,
        segmentSets: [
          { kind: 'lap', labelText: 'Laps', unitMeters: null, rows: [row(1, 400, 80), row(2, 400, 80)] },
        ],
      }),
    );

    expect(r.warnings).toContain('segments_unverified');
    expect(r.laps).toHaveLength(2);
  });
});

describe('구간표 배치', () => {
  it('split 표를 splits로 옮기고 단위를 유지한다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 3000,
        durationSeconds: 915,
        segmentSets: [
          {
            kind: 'split',
            labelText: 'Splits',
            unitMeters: 1000,
            rows: [row(1, 1000, 312), row(2, 1000, 298), row(3, 1000, 305)],
          },
        ],
      }),
    );

    expect(r.splits).toHaveLength(3);
    expect(r.splitUnitMeters).toBe(1000);
    expect(r.laps).toBeUndefined();
    expect(r.warnings).toEqual([]);
  });

  it('lap 표를 laps로 옮긴다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 2400,
        durationSeconds: 510,
        segmentSets: [
          {
            kind: 'lap',
            labelText: 'Laps',
            unitMeters: null,
            rows: [row(1, 400, 80), row(2, 800, 170), row(3, 1200, 260)],
          },
        ],
      }),
    );

    expect(r.laps).toHaveLength(3);
    expect(r.splits).toBeUndefined();
    expect(r.splitUnitMeters).toBeUndefined();
  });

  it('splits와 laps가 함께 와도 각각 담긴다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 2000,
        durationSeconds: 610,
        segmentSets: [
          {
            kind: 'split',
            labelText: 'Splits',
            unitMeters: 1000,
            rows: [row(1, 1000, 312), row(2, 1000, 298)],
          },
          {
            kind: 'lap',
            labelText: 'Laps',
            unitMeters: null,
            rows: [row(1, 400, 80), row(2, 1600, 530)],
          },
        ],
      }),
    );

    expect(r.splits).toHaveLength(2);
    expect(r.laps).toHaveLength(2);
    expect(r.splitUnitMeters).toBe(1000);
  });

  it('빈 구간표는 무시한다', () => {
    const r = toExtractedActivity(
      dto({ segmentSets: [{ kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: [] }] }),
    );

    expect(r.splits).toBeUndefined();
    expect(r.laps).toBeUndefined();
    expect(r.warnings).toEqual([]);
  });
});

describe('여러 장에 걸친 표', () => {
  /** 1km 구간 n개 */
  const km = (n: number, durationSeconds = 300) =>
    Array.from({ length: n }, (_, i) => row(i + 1, 1000, durationSeconds));

  it('같은 종류의 표를 순서대로 이어붙인다', () => {
    // 21.10km 기록의 구간표가 스크린샷 두 장에 10개 + 12개로 나뉜 경우
    const r = toExtractedActivity(
      dto({
        distanceMeters: 21100,
        durationSeconds: 5203,
        segmentSets: [
          { kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: km(10, 240) },
          {
            kind: 'split',
            labelText: 'Splits',
            unitMeters: 1000,
            rows: [...km(11, 240), row(12, 100, 43)],
          },
        ],
      }),
    );

    expect(r.splits).toHaveLength(22);
    expect(r.splits!.map((s) => s.index)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(r.splits![21].distanceMeters).toBe(100);
    expect(r.splitUnitMeters).toBe(1000);
    expect(r.warnings).toEqual([]);
  });

  it('같은 표를 두 번 보고하면 합계가 어긋나 경고한다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 3000,
        durationSeconds: 915,
        segmentSets: [
          { kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: km(3, 305) },
          { kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: km(3, 305) },
        ],
      }),
    );

    // 버리지 않는다. 대신 검산에서 걸러 사용자가 확인하게 한다
    expect(r.splits).toHaveLength(6);
    expect(r.warnings).toContain('segments_unverified');
  });

  it('두 장에 걸친 누적 표기는 합친 뒤에야 되돌릴 수 있다', () => {
    // 각 장만 보면 합도 마지막 값도 총거리와 맞지 않아 판정이 불가능하다
    const r = toExtractedActivity(
      dto({
        distanceMeters: 4000,
        durationSeconds: 1220,
        segmentSets: [
          {
            kind: 'split',
            labelText: 'KM',
            unitMeters: 1000,
            rows: [row(1, 1000, 300), row(2, 2000, 610)],
          },
          {
            kind: 'split',
            labelText: 'KM',
            unitMeters: 1000,
            rows: [row(1, 3000, 915), row(2, 4000, 1220)],
          },
        ],
      }),
    );

    expect(r.splits!.map((s) => s.distanceMeters)).toEqual([1000, 1000, 1000, 1000]);
    expect(r.warnings).toEqual([]);
  });

  it('split과 lap은 서로 섞이지 않는다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 2000,
        durationSeconds: 610,
        segmentSets: [
          { kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: km(2, 305) },
          { kind: 'lap', labelText: 'Laps', unitMeters: null, rows: [row(1, 400, 80), row(2, 1600, 530)] },
        ],
      }),
    );

    expect(r.splits).toHaveLength(2);
    expect(r.laps).toHaveLength(2);
  });

  it('단위는 처음 알려준 값을 유지한다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 2000,
        durationSeconds: 610,
        segmentSets: [
          { kind: 'split', labelText: 'Splits', unitMeters: 1000, rows: km(1, 305) },
          { kind: 'split', labelText: 'Splits', unitMeters: null, rows: km(1, 305) },
        ],
      }),
    );

    expect(r.splitUnitMeters).toBe(1000);
  });
});

describe('종류 추정', () => {
  it('kind가 unknown이면 숫자로 추정한다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 3240,
        durationSeconds: 990,
        segmentSets: [
          {
            kind: 'unknown',
            labelText: 'KM',
            unitMeters: null,
            rows: [row(1, 1000, 312), row(2, 1000, 298), row(3, 1000, 305), row(4, 240, 75)],
          },
        ],
      }),
    );

    expect(r.splits).toHaveLength(4);
    expect(r.splitUnitMeters).toBe(1000);
    expect(r.warnings).not.toContain('unknown_segment_kind');
  });

  it('추정도 실패하면 랩으로 두고 경고한다', () => {
    // 500m 균일 — 알려진 단위가 아니라 inferSegmentKind가 unknown을 낸다
    const r = toExtractedActivity(
      dto({
        distanceMeters: 1500,
        durationSeconds: 450,
        segmentSets: [
          {
            kind: 'unknown',
            labelText: null,
            unitMeters: null,
            rows: [row(1, 500, 150), row(2, 500, 150), row(3, 500, 150)],
          },
        ],
      }),
    );

    expect(r.laps).toHaveLength(3);
    expect(r.splits).toBeUndefined();
    expect(r.warnings).toContain('unknown_segment_kind');
  });
});

describe('정규화 연동', () => {
  it('누적 거리 표기를 구간별로 되돌린다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 3000,
        durationSeconds: 915,
        segmentSets: [
          {
            kind: 'split',
            labelText: 'KM',
            unitMeters: 1000,
            rows: [row(1, 1000, 312), row(2, 2000, 298), row(3, 3000, 305)],
          },
        ],
      }),
    );

    expect(r.splits!.map((s) => s.distanceMeters)).toEqual([1000, 1000, 1000]);
    expect(r.warnings).toEqual([]);
  });

  it('index가 뒤섞이거나 0부터 시작해도 1..n으로 다시 매긴다', () => {
    const r = toExtractedActivity(
      dto({
        distanceMeters: 3000,
        durationSeconds: 915,
        segmentSets: [
          {
            kind: 'split',
            labelText: 'Splits',
            unitMeters: 1000,
            rows: [row(2, 1000, 298), row(0, 1000, 312), row(1, 1000, 305)],
          },
        ],
      }),
    );

    expect(r.splits!.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(r.splits!.map((s) => s.durationSeconds)).toEqual([312, 305, 298]);
  });
});