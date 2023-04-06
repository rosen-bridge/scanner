import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1680777406000 implements MigrationInterface {
  name = 'migration1680777406000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commitment_entity" ADD "rwtCount" varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commitment_entity" DROP COLUMN "rwtCount"`
    );
  }
}
