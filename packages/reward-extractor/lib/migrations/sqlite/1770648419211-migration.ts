import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770648419211 implements MigrationInterface {
  name = 'Migration1770648419211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "reward_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "block" varchar NOT NULL,
                "height" integer NOT NULL,
                "extractor" varchar NOT NULL,
                "identifier" varchar NOT NULL,
                "serialized" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                "bridgeFee" bigint NOT NULL,
                "networkFee" bigint NOT NULL,
                "emissionTokenId" varchar NOT NULL,
                "guardsEmission" bigint NOT NULL,
                "watchersEmission" bigint NOT NULL,
                "rewardedWIDsCount" integer NOT NULL,
                "rewardedWIDs" varchar NOT NULL,
                CONSTRAINT "UQ_f791d9b1f1013fe8173296b1524" UNIQUE ("identifier", "extractor")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "reward_entity"
        `);
  }
}
