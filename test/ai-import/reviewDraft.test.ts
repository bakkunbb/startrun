import {
  parsePureNum,
  parseDistanceKm,
  parseDuration,
} from '@/features/ai-import/domain/parseInput';
import { toActivity, validateDraft } from '@/features/ai-import/domain/reviewDraft';
import type { ReviewDraft } from '@/features/ai-import/domain/reviewDraft';

describe('parseDistanceKm', () => {
  it('km 문자열을 미터로 바꾼다', () => {
    expect(parseDistanceKm('10.24')).toBe(10240);
    expect(parseDistanceKm('10')).toBe(10000);
    expect(parseDistanceKm('0.4')).toBe(400);
  });

  it('앞뒤 공백과 쉼표 소수점을 받아준다', () => {
    expect(parseDistanceKm(' 5.30 ')).toBe(5300);
    expect(parseDistanceKm('10,24')).toBe(10240);
  });

  it('형식이 아니면 null', () => {
    expect(parseDistanceKm('')).toBeNull();
    expect(parseDistanceKm('abc')).toBeNull();
    expect(parseDistanceKm('-5')).toBeNull();
    expect(parseDistanceKm('1.2.3')).toBeNull();
  });
});

describe('parseDuration', () => {
  it('분:초와 시:분:초를 초로 바꾼다', () => {
    expect(parseDuration('52:31')).toBe(3151);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('1:26:43')).toBe(5203);
    expect(parseDuration('0:59')).toBe(59);
  });

  it('구분자 없는 숫자는 초로 본다', () => {
    expect(parseDuration('90')).toBe(90);
  });

  it("Suunto의 20'33.0 표기도 받아준다", () => {
    expect(parseDuration("20'33.0")).toBe(1233);
    expect(parseDuration('52:31.4')).toBe(3151);
  });

  it('형식이 아니면 null', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('52:61')).toBeNull(); // 초가 60 이상
    expect(parseDuration('1:2:3:4')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('52:')).toBeNull();
  });
});

describe('parseCalories', () => {
  it('정수를 읽는다', () => {
    expect(parsePureNum('642')).toBe(642);
  });

  it('빈 문자열은 값 없음이지 오류가 아니다', () => {
    expect(parsePureNum('')).toBeUndefined();
  });

  it('형식이 아니면 null', () => {
    expect(parsePureNum('abc')).toBeNull();
    expect(parsePureNum('-1')).toBeNull();
  });
});

const draft = (over: Partial<ReviewDraft> = {}): ReviewDraft => ({
  startedAt: new Date('2026-07-24T06:12:00'),
  distanceMeters: 10240,
  durationSeconds: 3151,
  ...over,
});

const NOW = new Date('2026-08-13T12:00:00');

describe('validateDraft', () => {
  it('채워져 있으면 오류가 없다', () => {
    expect(validateDraft(draft(), NOW)).toEqual([]);
  });

  it('필수 항목이 비면 각각 보고한다', () => {
    const errors = validateDraft(
      draft({ distanceMeters: null, durationSeconds: null, startedAt: null }),
      NOW,
    );

    expect(errors).toEqual(['distance_required', 'duration_required', 'started_at_required']);
  });

  it('0 이하는 거부한다', () => {
    expect(validateDraft(draft({ distanceMeters: 0 }), NOW)).toEqual(['distance_invalid']);
    expect(validateDraft(draft({ durationSeconds: -1 }), NOW)).toEqual(['duration_invalid']);
  });

  it('미래 시각은 거부하되 시계 오차는 허용한다', () => {
    expect(validateDraft(draft({ startedAt: new Date('2026-09-01') }), NOW)).toEqual([
      'started_at_future',
    ]);
    expect(validateDraft(draft({ startedAt: new Date(NOW.getTime() + 30_000) }), NOW)).toEqual([]);
  });
});

describe('toActivity', () => {
  it('Activity로 옮긴다', () => {
    const a = toActivity(
      draft({ calories: 642, laps: [{ index: 1, distanceMeters: 400, durationSeconds: 80 }] }),
      'x1',
    );

    expect(a.id).toBe('x1');
    expect(a.source).toBe('ai_import');
    expect(a.distanceMeters).toBe(10240);
    expect(a.calories).toBe(642);
    expect(a.laps).toHaveLength(1);
    expect(a.externalId).toBeUndefined();
  });

  it('검증을 통과하지 못하면 던진다', () => {
    expect(() => toActivity(draft({ distanceMeters: null }), 'x1')).toThrow(/distance_required/);
  });
});
