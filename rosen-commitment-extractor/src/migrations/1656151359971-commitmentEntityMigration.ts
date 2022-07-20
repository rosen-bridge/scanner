import { MigrationInterface, QueryRunner } from "typeorm";

export class commitmentEntityMigration1656151359971 implements MigrationInterface {
    name = 'commitmentEntityMigration1656151359971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "commitment_entity" 
                (
                    "id" integer PRIMARY KEY NOT NULL,
                    "extractor": varchar NOT NULL,
                    "eventId" varchar NOT NULL,
                    "commitment" varchar NOT NULL,
                    "WID" varchar NOT NULL,
                    "commitmentBoxId" varchar NOT NULL,
                    "eventTriggerBoxId" varchar,
                    "block" varchar NOT NULL,
                    "spendBlock" varchar,
//                     CONSTRAINT "FK_500f90c61fb27327ee25350c33b" FOREIGN KEY ("blockHeight") 
//                         REFERENCES "bridge_block_entity" ("height") ON DELETE CASCADE ON UPDATE NO ACTION,
//                     CONSTRAINT "FK_e43db92f2466f82759cec509625" FOREIGN KEY ("spendBlockHeight") 
//                         REFERENCES "bridge_block_entity" ("height") ON DELETE SET NULL ON UPDATE NO ACTION
                )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "commitment_entity"`);
    }

}
