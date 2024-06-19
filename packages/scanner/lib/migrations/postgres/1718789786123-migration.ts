import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1718789786123 implements MigrationInterface {
  name = 'migration1718789786123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "extractor_status_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
