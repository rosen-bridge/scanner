import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1783425106904 implements MigrationInterface {
  name = 'Migration1783425106904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP CONSTRAINT "UQ_cc294fc304a66f8f194840f1ece"
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity" RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" RENAME COLUMN "boxSerialized" TO "serialized"
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity" ALTER COLUMN "spendBlock" TYPE character varying
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD CONSTRAINT "UQ_61e30957d6e9fd30af07bedb28c" UNIQUE ("identifier", "extractor")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP CONSTRAINT "UQ_61e30957d6e9fd30af07bedb28c"
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity" ALTER COLUMN "spendBlock" TYPE text
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity" RENAME COLUMN "serialized" TO "boxSerialized"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" RENAME COLUMN "identifier" TO "boxId"
        `);

    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD CONSTRAINT "UQ_cc294fc304a66f8f194840f1ece" UNIQUE ("extractor", "boxId")
        `);
  }
}
