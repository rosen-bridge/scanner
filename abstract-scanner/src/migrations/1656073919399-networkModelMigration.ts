import { MigrationInterface, QueryRunner } from "typeorm";

export class networkModelMigration1656073919399 implements MigrationInterface {
    name = 'networkModelMigration1656073919399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "block_entity" 
                (
                    "height" integer PRIMARY KEY NOT NULL, 
                    "hash" varchar(64) NOT NULL,
                    "parentHash" varchar(64) NOT NULL, 
                    "status" varchar NOT NULL, 
                    CONSTRAINT "UQ_height" UNIQUE ("height"),
                    CONSTRAINT "UQ_hash" UNIQUE ("hash"),
                    CONSTRAINT "UQ_parentHash" UNIQUE ("parentHash")
                )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "block_entity"`);
    }

}
