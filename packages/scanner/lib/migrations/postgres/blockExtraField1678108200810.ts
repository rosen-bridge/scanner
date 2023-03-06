import { MigrationInterface, QueryRunner } from 'typeorm';

export class blockExtraField1678108200810 implements MigrationInterface {
  name = 'blockExtraField1678108200810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE block_entity ADD "extra" varchar;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE block_entity DROP COLUMN "extra";`);
  }
}
