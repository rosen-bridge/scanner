import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

import { DataSource, EntityManager } from '@rosen-bridge/extended-typeorm';

import { BlockEntity, PROCEED } from '../../lib/entities/blockEntity';
import { ExtractorStatusEntity } from '../../lib/entities/extractorStatusEntity';
import { migrations } from '../../lib/migrations';
import { BlockDbAction } from '../../lib/scanner/action';

export const postgresScenarios = [
  'guards0',
  'guards1',
  'guards10',
  'collision',
  'branch-limit',
  'null',
  'empty',
  'multi-row',
] as const;

type Scenario = (typeof postgresScenarios)[number];
export type SchemaIdentity = { name: string; oid: number; token: string };
type SchemaRow = { name: string; oid: number; token: string | null };
type PgClient = {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(sql: string, parameters?: unknown[]): Promise<{ rows: SchemaRow[] }>;
};

/** Refuse cleanup unless this run created the exact recorded schema identity. */
export const assertOwnedSchema = (
  created: SchemaIdentity | undefined,
  observed: SchemaRow | undefined,
) => {
  assert.ok(created, 'No schema was created by this run');
  assert.match(created.name, /^scanner_test_[a-f0-9]{32}$/);
  assert.match(created.token, /^[a-f0-9]{32}$/);
  assert.ok(Number.isInteger(created.oid) && created.oid > 0);
  assert.deepEqual(
    observed,
    created,
    'Schema ownership changed; cleanup refused',
  );
};

const schemaIdentitySql = `SELECT nspname AS name, oid,
  obj_description(oid, 'pg_namespace') AS token
  FROM pg_namespace WHERE nspname = $1`;

export const runPostgresCleanupScenario = async (
  connectionString: string,
  scenario: Scenario,
) => {
  let stage = 'connection configuration';
  let source: DataSource | undefined;
  let created: SchemaIdentity | undefined;
  let admin: PgClient | undefined;
  const cleanup = async () => {
    let failed = false;
    try {
      if (source?.isInitialized) await source.destroy();
      assert.ok(!source?.isInitialized);
      if (created && admin) {
        // Never use a matching prefix to adopt a schema created by another run.
        await admin.query('BEGIN');
        try {
          const observed = (
            await admin.query(schemaIdentitySql, [created.name])
          ).rows[0];
          assertOwnedSchema(created, observed);
          await admin.query(`DROP SCHEMA "${created.name}" CASCADE`);
          await admin.query('COMMIT');
        } catch (error) {
          await admin.query('ROLLBACK');
          throw error;
        }
        assert.equal(
          (await admin.query(schemaIdentitySql, [created.name])).rows.length,
          0,
        );
      }
    } catch {
      failed = true;
    }
    try {
      await admin?.end();
    } catch {
      failed = true;
    }
    if (failed) {
      throw new Error(
        'PostgreSQL fixture cleanup refused or failed; inspect its generated schema',
      );
    }
  };
  try {
    const url = new URL(connectionString);
    assert.ok(['postgres:', 'postgresql:'].includes(url.protocol));
    const bootstrap = '@rosen-bridge/extended-typeorm/bootstrap';
    await import(bootstrap);
    const pg = createRequire(import.meta.url)('pg');
    admin = new pg.Client({
      connectionString,
      connectionTimeoutMillis: 5000,
      query_timeout: 15000,
      statement_timeout: 10000,
    }) as PgClient;
    stage = 'admin connection';
    await admin.connect();
    const name = `scanner_test_${randomUUID().replaceAll('-', '')}`;
    const token = randomUUID().replaceAll('-', '');
    stage = 'schema creation';
    await admin.query('BEGIN');
    try {
      await admin.query(`CREATE SCHEMA "${name}"`);
      await admin.query(`COMMENT ON SCHEMA "${name}" IS '${token}'`);
      const row = (await admin.query(schemaIdentitySql, [name])).rows[0];
      const identity = { name, oid: row.oid, token };
      assertOwnedSchema(identity, row);
      await admin.query('COMMIT');
      created = identity;
    } catch (error) {
      await admin.query('ROLLBACK');
      throw error;
    }

    const queries: string[] = [];
    source = new DataSource({
      type: 'postgres',
      url: connectionString,
      driver: pg,
      schema: name,
      extra: {
        max: 1,
        options: `-c search_path=${name}`,
        connectionTimeoutMillis: 5000,
        query_timeout: 15000,
        statement_timeout: 10000,
      },
      entities: [BlockEntity, ExtractorStatusEntity],
      migrations: migrations.postgres,
      synchronize: false,
      logging: ['query'],
      logger: {
        logQuery: (query: string) => queries.push(query),
        logQueryError() {},
        logQuerySlow() {},
        logSchemaBuild() {},
        logMigration() {},
        log() {},
      },
    });
    stage = 'connection schema isolation';
    await source.initialize();
    assert.ok(source.manager instanceof EntityManager);
    const [scope] = await source.query(
      `SELECT current_schema() AS schema, current_setting('search_path') AS path`,
    );
    assert.equal(scope.schema, name);
    assert.equal(scope.path, name);
    stage = 'native migrations';
    assert.equal(migrations.postgres.length, 7);
    assert.equal((await source.runMigrations()).length, 7);
    assert.deepEqual(await source.runMigrations(), []);
    const history = await source.query(
      `SELECT name FROM "${name}"."migrations" ORDER BY timestamp`,
    );
    const migrationNames = migrations.postgres.map(
      (Migration) => new Migration().name,
    );
    assert.deepEqual(
      history.map((row: { name: string }) => row.name),
      migrationNames,
    );

    stage = 'native block cleanup';
    const repository = source.manager.getRepository(BlockEntity);
    const rows = [1, 2, 3, 4, 5].map((height) => ({
      height,
      hash: `block${height}`,
      parentHash: `parent${height}`,
      scanner: 'bitcoin-cash',
      status: PROCEED,
      timestamp: height,
    }));
    const foreign = {
      height: 6,
      hash: 'foreign',
      parentHash: 'parent6',
      scanner: 'ergo',
      status: PROCEED,
      timestamp: 0,
    };
    await repository.insert([...rows, foreign]);
    const query = (condition: string, parameters: Record<string, unknown>) =>
      repository
        .createQueryBuilder('used')
        .select('used.hash', 'block')
        .where(condition, parameters);
    let references;
    let batch = 10;
    let threshold = 6;
    let expected: string[];
    if (scenario.startsWith('guards') || scenario === 'branch-limit') {
      references = [
        query('used.height < :height', { height: 5 })
          .orderBy('used.height', 'DESC')
          .take(1),
        query('used.height < :height', { height: 3 })
          .orderBy('used.height', 'ASC')
          .take(1),
      ];
      if (scenario.startsWith('guards')) {
        batch = Number(scenario.slice(6));
        threshold = 5;
      }
      expected =
        batch === 0
          ? rows.map((row) => row.hash)
          : batch === 1
            ? ['block1', 'block3', 'block4', 'block5']
            : threshold === 5
              ? ['block1', 'block4', 'block5']
              : ['block1', 'block4'];
    } else if (scenario === 'multi-row') {
      references = [query('used.height <= :height', { height: 2 })];
      expected = ['block1', 'block2'];
    } else {
      const first = query('used.hash = :hash', { hash: 'block1' });
      const second = query('used.hash = :hash', {
        hash: scenario === 'empty' ? 'absent' : 'block2',
      });
      if (scenario === 'null') second.select('NULL', 'block');
      references = [first, second];
      expected =
        scenario === 'null'
          ? rows.map((row) => row.hash)
          : scenario === 'empty'
            ? ['block1']
            : ['block1', 'block2'];
    }
    const start = queries.length;
    await new BlockDbAction(source, 'bitcoin-cash').removeUnusedBlocksInBatches(
      references,
      batch,
      'bitcoin-cash',
      threshold,
    );
    const actionQueries = queries.slice(start);
    assert.equal(actionQueries.length, 1);
    assert.match(actionQueries[0], /^DELETE FROM/);
    const remaining = await repository.find({ order: { height: 'ASC' } });
    assert.deepEqual(
      remaining.map((row) => row.hash),
      [...expected, 'foreign'],
    );
    assert.ok(
      remaining.every(
        (row) =>
          typeof row.id === 'number' &&
          typeof row.height === 'number' &&
          typeof row.timestamp === 'number',
      ),
    );
    return {
      migrationNames,
      migrationReplayCount: 0,
      remaining,
      expected: [...expected, 'foreign'],
    };
  } catch {
    // Never put the operator's URL or a driver error containing credentials in test output.
    throw new Error(`PostgreSQL cleanup fixture failed during ${stage}`);
  } finally {
    await cleanup();
  }
};
