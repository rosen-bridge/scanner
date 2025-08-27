import { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class migration1718789744123 implements MigrationInterface {
  name = 'migration1718789744123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "extractor_status_entity"
        `);
  }

  public async down(): Promise<void> {
    return;
  }
}
