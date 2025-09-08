import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class migration1737785465594 implements MigrationInterface {
  name = 'Migration1737785465594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            RENAME COLUMN "createBlock" TO "block"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            RENAME COLUMN "creationHeight" TO "height"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            ALTER COLUMN "spendBlock" TYPE character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity"
            ADD CONSTRAINT "UQ_86fbe5bb307de1305cc22efa762" UNIQUE ("boxId", "extractor")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "box_entity" DROP CONSTRAINT "UQ_86fbe5bb307de1305cc22efa762"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            ALTER COLUMN "spendBlock" TYPE text
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            RENAME COLUMN "block" TO "createBlock"
        `);
    await queryRunner.query(`
            ALTER TABLE "box_entity" 
            RENAME COLUMN "height" TO "creationHeight"
        `);
  }
}
