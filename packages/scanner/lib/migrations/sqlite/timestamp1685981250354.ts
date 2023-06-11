import { MigrationInterface, QueryRunner } from 'typeorm';

export class timestamp1685981250354 implements MigrationInterface {
  name = 'timestamp1685981250354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" ADD "timestamp" bigint NOT NULL DEFAULT 0;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "block_entity" DROP COLUMN "timestamp";
        `);
  }
}
