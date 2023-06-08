import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1685962565687 implements MigrationInterface {
  name = 'migration1685962565687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" ADD "txId" varchar;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permit_entity" 
            DROP COLUMN "txId";
        `);
  }
}
