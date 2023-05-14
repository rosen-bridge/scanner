import { MigrationInterface, QueryRunner } from 'typeorm';

export class TxIdEntity1683960694422 implements MigrationInterface {
  name = 'TxIdEntity1683960694422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tx_id_entity" (
        "id" serial PRIMARY KEY NOT NULL,
        "txId" varchar NOT NULL, 
        "blockId" varchar NOT NULL, 
        "extractor" varchar NOT NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tx_id_entity"`);
  }
}
