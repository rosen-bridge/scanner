import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1758958610937 implements MigrationInterface {
  name = 'Migration1758958610937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP CONSTRAINT "UQ_86fbe5bb307de1305cc22efa762"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
                RENAME COLUMN "boxId" TO "identifier"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD CONSTRAINT "UQ_a7a8410fbcd784583cae876e6b9" UNIQUE ("identifier", "extractor")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP CONSTRAINT "UQ_a7a8410fbcd784583cae876e6b9"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
                RENAME COLUMN "identifier" TO "boxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD CONSTRAINT "UQ_86fbe5bb307de1305cc22efa762" UNIQUE ("boxId", "extractor")
        `);
  }
}
