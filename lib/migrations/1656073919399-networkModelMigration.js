export class networkModelMigration1656073919399 {
    name = 'networkModelMigration1656073919399';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "block_entity" 
                (
                    "height" integer PRIMARY KEY NOT NULL, 
                    "hash" varchar(64) NOT NULL,
                    "parentHash" varchar(64) NOT NULL, 
                    "status" varchar NOT NULL, 
                    "scanner" varchar NOT NULL, 
                    CONSTRAINT "UQ_height" UNIQUE ("height"),
                    CONSTRAINT "UQ_hash" UNIQUE ("hash"),
                    CONSTRAINT "UQ_parentHash" UNIQUE ("parentHash")
                )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "block_entity"`);
    }
}
