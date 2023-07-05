import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688555566662 implements MigrationInterface {
  name = 'migration1688555566662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "box_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "address" varchar NOT NULL,
                "boxId" varchar NOT NULL,
                "createBlock" varchar NOT NULL,
                "creationHeight" integer NOT NULL,
                "serialized" varchar NOT NULL,
                "spendBlock" text,
                "extractor" varchar NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "box_entity"
        `);
  }
}
