import { MigrationInterface, QueryRunner } from 'typeorm';

export class blockExtraField1671715062412 implements MigrationInterface {
  name = 'blockExtraField1671715062412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE block_entity ADD "extra" varchar;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE block_entity DROP COLUMN "extra";`);
  }
}
