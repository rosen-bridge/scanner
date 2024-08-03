import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1722697954558 implements MigrationInterface {
  name = 'migration1722697954558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_7e20625b11840edf7f120565c3d"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ALTER COLUMN "hash" TYPE character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ALTER COLUMN "parentHash" TYPE character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner")
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP CONSTRAINT "UQ_7e20625b11840edf7f120565c3d"
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ALTER COLUMN "parentHash" character varying(64) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ALTER COLUMN "hash" character varying(64) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner")
        `);
    await queryRunner.query(`
            ALTER TABLE "block_entity"
            ADD CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner")
        `);
  }
}
