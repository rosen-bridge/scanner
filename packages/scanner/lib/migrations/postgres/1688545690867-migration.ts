import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1688545690867 implements MigrationInterface {
  name = 'migration1688545690867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "block_entity" (
                "id" SERIAL NOT NULL,
                "height" integer NOT NULL,
                "hash" character varying(64) NOT NULL,
                "parentHash" character varying(64) NOT NULL,
                "status" character varying NOT NULL,
                "extra" character varying,
                "scanner" character varying NOT NULL,
                "timestamp" integer NOT NULL,
                "year" integer,
                "month" integer,
                "day" integer,
                CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner"),
                CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner"),
                CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("height", "scanner"),
                CONSTRAINT "PK_c3ddd57793960562837e8a402f1" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "block_entity"
        `);
  }
}
