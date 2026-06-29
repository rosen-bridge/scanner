import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1782948062354 implements MigrationInterface {
  name = 'Migration1782948062354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" RENAME COLUMN "boxSerialized"  TO "serialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendBlock" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD CONSTRAINT "UQ_205c6c8499dff192ec078910956" UNIQUE ("identifier", "extractor")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendBlock" text
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "serialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "boxSerialized" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "boxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD CONSTRAINT "UQ_d3226602b909b64bcaeadc39c3c" UNIQUE ("extractor", "boxId")
        `);
  }
}
