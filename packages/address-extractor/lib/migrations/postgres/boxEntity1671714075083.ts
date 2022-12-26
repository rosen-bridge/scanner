import { MigrationInterface, QueryRunner } from 'typeorm';

export class boxEntity1671714075083 implements MigrationInterface {
  name = 'boxEntity1671714075083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "box_entity" (
                        "id" serial PRIMARY KEY NOT NULL,
                        "address" varchar NOT NULL, 
                        "boxId" varchar NOT NULL, 
                        "createBlock" varchar NOT NULL, 
                        "creationHeight" integer NOT NULL, 
                        "serialized" varchar NOT NULL, 
                        "spendBlock" text, 
                        "extractor" varchar NOT NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "box_entity"`);
  }
}
