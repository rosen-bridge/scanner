import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1782948062354 implements MigrationInterface {
  name = 'Migration1782948062354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    DROP CONSTRAINT IF EXISTS "UQ_d3226602b909b64bcaeadc39c3c"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    RENAME COLUMN "boxId" TO "identifier"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    RENAME COLUMN "boxSerialized" TO "serialized"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    ALTER COLUMN "spendBlock" TYPE character varying
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    ADD CONSTRAINT "UQ_205c6c8499dff192ec078910956"
    UNIQUE ("identifier", "extractor")
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    DROP CONSTRAINT IF EXISTS "UQ_205c6c8499dff192ec078910956"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    ALTER COLUMN "spendBlock" TYPE text
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    RENAME COLUMN "serialized" TO "boxSerialized"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    RENAME COLUMN "identifier" TO "boxId"
  `);

    await queryRunner.query(`
    ALTER TABLE "permit_entity"
    ADD CONSTRAINT "UQ_d3226602b909b64bcaeadc39c3c"
    UNIQUE ("extractor", "boxId")
  `);
  }
}
