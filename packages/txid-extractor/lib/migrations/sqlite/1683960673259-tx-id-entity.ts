import { MigrationInterface, QueryRunner } from 'typeorm';

export class TxIdEntity1683960673259 implements MigrationInterface {
  name = 'TxIdEntity1683960673259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tx_id_entity" (
                        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                        "tx_id" varchar NOT NULL, 
                        "block" varchar NOT NULL, 
                        "extractor" varchar NOT NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tx_id_entity"`);
  }
}
