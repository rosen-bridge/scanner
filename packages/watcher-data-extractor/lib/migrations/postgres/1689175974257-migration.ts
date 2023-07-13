import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1689175974257 implements MigrationInterface {
  name = 'migration1689175974257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "spendBlock" text
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD "spendBlock" text
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendBlock" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "permit_entity"
            ADD "spendBlock" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "commitment_entity"
            ADD "spendBlock" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity" DROP COLUMN "spendBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_trigger_entity"
            ADD "spendBlock" character varying
        `);
  }
}
