import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688558553044 implements MigrationInterface {
  name = 'migration1688558553044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "box_entity" (
                "id" SERIAL NOT NULL,
                "address" character varying NOT NULL,
                "boxId" character varying NOT NULL,
                "createBlock" character varying NOT NULL,
                "creationHeight" integer NOT NULL,
                "serialized" character varying NOT NULL,
                "spendBlock" text,
                "extractor" character varying NOT NULL,
                CONSTRAINT "PK_b3b74bea44218399800c0136bb6" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "box_entity"
        `);
  }
}
