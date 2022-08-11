import { MigrationInterface, QueryRunner } from "typeorm";

export class networkModelMigration1656073919399 implements MigrationInterface {
    name = 'networkModelMigration1656073919399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "block_entity" (
                                        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
                                        "height" integer NOT NULL, 
                                        "hash" varchar(64) NOT NULL, 
                                        "parentHash" varchar(64) NOT NULL, 
                                        "status" varchar NOT NULL, 
                                        "scanner" varchar NOT NULL, 
                                        CONSTRAINT "UQ_7e20625b11840edf7f120565c3d" UNIQUE ("parentHash", "scanner"), 
                                        CONSTRAINT "UQ_b1e24c5950a7c3dd48d92bbfbb2" UNIQUE ("hash", "scanner"), 
                                        CONSTRAINT "UQ_521d830047d5fe08988538289dd" UNIQUE ("height", "scanner"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "block_entity"`);
    }

}
