import { migrate } from '@/core/database/migrations';
import type { SqlDatabase } from '@/core/database/types';
import type { Activity } from '@/features/activity/domain/entities/Activity';
import type { Segment } from '@/features/activity/domain/entities/Segment';
import { ActivityLocalDataSource } from '@/features/activity/data/datasources/ActivityLocalDataSource';
import { ActivityRepositoryImpl } from '@/features/activity/data/repositories/ActivityRepositoryImpl';
import { createTestDb } from '../helpers/testDb';

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

let db: SqlDatabase;
let repo: ActivityRepositoryImpl;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  repo = new ActivityRepositoryImpl(new ActivityLocalDataSource(db));
});

afterEach(async () => {
  await db.close();
});

describe('저장과 조회', () => {
  it('저장한 기록을 그대로 되찾는다', async () => {
    await repo.save(activity({ calories: 642, note: '한강 야간 러닝', externalId: '9911' }));

    const all = await repo.getAll();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('a1');
    expect(all[0].calories).toBe(642);
    expect(all[0].note).toBe('한강 야간 러닝');
    expect(all[0].externalId).toBe('9911');
    expect(all[0].startedAt.getTime()).toBe(new Date('2026-07-24T06:12:00Z').getTime());
  });

  it('자동 분할과 랩을 함께 저장하고 복원한다', async () => {
    await repo.save(
      activity({
        splits: [seg(1, 1000, 312), seg(2, 1000, 298)],
        splitUnitMeters: 1000,
        laps: [seg(1, 400, 80), seg(2, 200, 70), seg(3, 400, 78)],
      }),
    );

    const a = (await repo.getById('a1'))!;

    expect(a.splits).toHaveLength(2);
    expect(a.laps).toHaveLength(3);
    expect(a.splitUnitMeters).toBe(1000);
    expect(a.laps!.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(a.splits![1]).toEqual(seg(2, 1000, 298));
  });

  it('구간이 없으면 undefined로 남는다', async () => {
    await repo.save(activity());

    const a = (await repo.getById('a1'))!;

    expect(a.splits).toBeUndefined();
    expect(a.laps).toBeUndefined();
  });

  it('최신 기록이 먼저 온다', async () => {
    await repo.save(activity({ id: 'old', startedAt: new Date('2026-07-20T06:00:00Z') }));
    await repo.save(activity({ id: 'new', startedAt: new Date('2026-07-24T06:00:00Z') }));
    await repo.save(activity({ id: 'mid', startedAt: new Date('2026-07-22T06:00:00Z') }));

    expect((await repo.getAll()).map((a) => a.id)).toEqual(['new', 'mid', 'old']);
  });

  it('없는 id는 null', async () => {
    expect(await repo.getById('nope')).toBeNull();
  });

  it('기록이 없으면 빈 배열', async () => {
    expect(await repo.getAll()).toEqual([]);
  });
});

describe('덮어쓰기', () => {
  it('같은 id로 저장하면 갱신되고 구간이 중복되지 않는다', async () => {
    await repo.save(activity({ laps: [seg(1, 400, 80), seg(2, 200, 70)], note: '첫 저장' }));
    await repo.save(activity({ laps: [seg(1, 500, 95)], note: '수정됨' }));

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].note).toBe('수정됨');
    expect(all[0].laps).toHaveLength(1);
    expect(all[0].laps![0].distanceMeters).toBe(500);

    const rows = (await db.execute('SELECT * FROM activity_segments')).rows;
    expect(rows).toHaveLength(1);
  });
});

describe('삭제', () => {
  it('기록을 지우면 구간도 함께 사라진다', async () => {
    await repo.save(activity({ laps: [seg(1, 400, 80)] }));

    await repo.remove('a1');

    expect(await repo.getAll()).toEqual([]);
    const rows = (await db.execute('SELECT * FROM activity_segments')).rows;
    expect(rows).toHaveLength(0);
  });
});

describe('트랜잭션', () => {
  it('구간 저장이 실패하면 기록도 저장되지 않는다', async () => {
    const local = new ActivityLocalDataSource(db);

    await expect(
      local.upsert(
        {
          id: 'a1',
          source: 'gps',
          started_at: 1,
          distance_m: 1,
          duration_s: 1,
          calories: null,
          note: null,
          external_id: null,
          split_unit_m: null,
        },
        // kind CHECK 제약을 어기는 행 — 삽입 중 실패한다
        [{ activity_id: 'a1', kind: 'bogus' as never, idx: 1, distance_m: 1000, duration_s: 300 }],
      ),
    ).rejects.toThrow();

    expect((await db.execute('SELECT * FROM activities')).rows).toHaveLength(0);
    expect((await db.execute('SELECT * FROM activity_segments')).rows).toHaveLength(0);
  });
});

describe('중복 감지', () => {
  it('허용 범위 안의 기록만 반환한다', async () => {
    const base = new Date('2026-07-24T06:00:00Z');
    await repo.save(activity({ id: 'in', startedAt: new Date(base.getTime() + 10 * 60000) }));
    await repo.save(activity({ id: 'out', startedAt: new Date(base.getTime() + 90 * 60000) }));

    const near = await repo.findNear(base, 30);

    expect(near.map((a) => a.id)).toEqual(['in']);
  });
});

describe('쿼리 효율', () => {
  it('getAll은 기록 수와 무관하게 쿼리를 2번만 실행한다', async () => {
    for (let i = 0; i < 5; i++) {
      await repo.save(activity({ id: `a${i}`, laps: [seg(1, 400, 80), seg(2, 200, 70)] }));
    }

    let count = 0;
    const counting: SqlDatabase = {
      ...db,
      execute: async (sql, params) => {
        count++;
        return db.execute(sql, params);
      },
    };
    const countingRepo = new ActivityRepositoryImpl(new ActivityLocalDataSource(counting));

    const all = await countingRepo.getAll();

    expect(all).toHaveLength(5);
    expect(all[0].laps).toHaveLength(2);
    // 기록 목록 1번 + 전체 구간 1번. 기록마다 구간을 조회하면 6번이 된다
    expect(count).toBe(2);
  });
});
