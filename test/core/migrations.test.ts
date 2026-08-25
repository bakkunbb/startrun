import { MIGRATIONS, migrate } from '@/core/database/migrations';
import type { SqlDatabase } from '@/core/database/types';
import { createTestDb, tableNames, userVersion } from '../helpers/testDb';

let db: SqlDatabase;

beforeEach(() => {
  db = createTestDb();
});

afterEach(async () => {
  await db.close();
});

const insertActivity = (id: string, extra: Record<string, unknown> = {}) =>
  db.execute(
    `INSERT INTO activities (id, source, started_at, distance_m, duration_s, external_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      extra.source ?? 'ai_import',
      extra.started_at ?? 1721783520000,
      extra.distance_m ?? 10240,
      extra.duration_s ?? 3151,
      extra.external_id ?? null,
    ],
  );

const insertSegment = (activityId: string, kind: string, idx: number) =>
  db.execute(
    `INSERT INTO activity_segments (activity_id, kind, idx, distance_m, duration_s)
     VALUES (?, ?, ?, ?, ?)`,
    [activityId, kind, idx, 1000, 312],
  );

describe('신규 설치', () => {
  it('모든 테이블을 만들고 버전을 기록한다', async () => {
    const v = await migrate(db);

    expect(v).toBe(MIGRATIONS.length);
    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await tableNames(db)).toEqual(['activities', 'activity_segments']);
  });

  it('activities 컬럼이 스펙대로 만들어진다', async () => {
    await migrate(db);
    const cols = (await db.execute('PRAGMA table_info(activities)')).rows;

    expect(cols.map((c) => c.name).sort()).toEqual(
      [
        'avg_hr',
        'calories',
        'distance_m',
        'duration_s',
        'external_id',
        'id',
        'note',
        'source',
        'split_unit_m',
        'started_at',
      ].sort(),
    );
    expect(cols.find((c) => c.name === 'source').notnull).toBe(1);
    expect(cols.find((c) => c.name === 'calories').notnull).toBe(0);
  });

  it('activity_segments 컬럼이 스펙대로 만들어진다', async () => {
    await migrate(db);
    const cols = (await db.execute('PRAGMA table_info(activity_segments)')).rows;

    expect(cols.map((c) => c.name).sort()).toEqual(
      ['activity_id', 'distance_m', 'duration_s', 'hr', 'idx', 'kind'].sort(),
    );
  });
});

describe('반복 실행', () => {
  it('여러 번 실행해도 안전하고 버전이 변하지 않는다', async () => {
    await migrate(db);
    await migrate(db);
    await migrate(db);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
  });
});

describe('기존 사용자 업그레이드', () => {
  it('새 마이그레이션만 적용하고 기존 데이터를 보존한다', async () => {
    await migrate(db);
    await insertActivity('a1');

    const future = [...MIGRATIONS, ['ALTER TABLE activities ADD COLUMN weather TEXT']];
    const v = await migrate(db, future);

    expect(v).toBe(future.length);
    expect(await userVersion(db)).toBe(future.length);

    const rows = (await db.execute('SELECT id, weather FROM activities')).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('a1');
    expect(rows[0].weather).toBeNull();
  });

  it('마이그레이션이 실패하면 롤백되어 버전이 오르지 않는다', async () => {
    await migrate(db);
    const broken = [...MIGRATIONS, ['THIS IS NOT SQL']];

    await expect(migrate(db, broken)).rejects.toThrow();
    expect(await userVersion(db)).toBe(MIGRATIONS.length);
  });
});

describe('구간 제약 조건', () => {
  it('kind는 split과 lap만 허용한다', async () => {
    await migrate(db);
    await insertActivity('a1');

    await expect(insertSegment('a1', 'bogus', 1)).rejects.toThrow();
  });

  it('자동 분할과 랩은 같은 번호로 공존할 수 있다', async () => {
    await migrate(db);
    await insertActivity('a1');

    await insertSegment('a1', 'split', 1);
    await insertSegment('a1', 'lap', 1);

    const rows = (await db.execute('SELECT * FROM activity_segments')).rows;
    expect(rows).toHaveLength(2);
  });

  it('같은 종류의 같은 번호는 거부한다', async () => {
    await migrate(db);
    await insertActivity('a1');

    await insertSegment('a1', 'split', 1);
    await expect(insertSegment('a1', 'split', 1)).rejects.toThrow();
  });

  it('기록을 지우면 구간도 함께 지워진다 (CASCADE)', async () => {
    await migrate(db);
    await insertActivity('a1');
    await insertSegment('a1', 'split', 1);
    await insertSegment('a1', 'lap', 1);

    await db.execute('DELETE FROM activities WHERE id = ?', ['a1']);

    const rows = (await db.execute('SELECT * FROM activity_segments')).rows;
    expect(rows).toHaveLength(0);
  });

  it('없는 기록의 구간은 저장할 수 없다 (FK)', async () => {
    await migrate(db);

    await expect(insertSegment('nope', 'lap', 1)).rejects.toThrow();
  });
});

describe('기록 중복 방지', () => {
  it('같은 소스의 external_id 중복을 거부한다', async () => {
    await migrate(db);
    await insertActivity('a1', { source: 'strava', external_id: '9911' });

    await expect(
      insertActivity('a2', { source: 'strava', external_id: '9911' }),
    ).rejects.toThrow();
  });

  it('external_id가 없는 기록은 여러 건 저장할 수 있다', async () => {
    await migrate(db);
    await insertActivity('a1');
    await insertActivity('a2');

    const rows = (await db.execute('SELECT * FROM activities')).rows;
    expect(rows).toHaveLength(2);
  });
});
