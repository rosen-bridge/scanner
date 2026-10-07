import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

const EXTRACTOR_ID_RENAMES: Array<[string, string]> = [
  ['bitcoin-esplora-extractor', 'bitcoin-observation-extractor'],
  ['bitcoin-rpc-extractor', 'bitcoin-observation-extractor'],
  ['doge-esplora-extractor', 'doge-observation-extractor'],
  ['doge-rpc-extractor', 'doge-observation-extractor'],
  ['bitcoin-runes-esplora-extractor', 'bitcoin-runes-observation-extractor'],
  ['bitcoin-runes-rpc-extractor', 'bitcoin-runes-observation-extractor'],
  ['cardano-blockfrost-extractor', 'cardano-observation-extractor'],
  ['cardano-koios-extractor', 'cardano-observation-extractor'],
  ['cardano-ogmios-extractor', 'cardano-observation-extractor'],
  ['ethereum-rpc-extractor', 'ethereum-observation-extractor'],
  ['binance-rpc-extractor', 'binance-observation-extractor'],
  ['handshake-rpc-extractor', 'handshake-observation-extractor'],
];

export class Migration1791280000100 implements MigrationInterface {
  name = 'Migration1791280000100';

  /**
   * rename observation extractor ids to <chain>-observation-extractor
   * for extractor status, the lowest updateHeight of merged ids is kept
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStatusTable = await queryRunner.hasTable(
      'extractor_status_entity',
    );
    for (const [oldId, newId] of EXTRACTOR_ID_RENAMES) {
      await queryRunner.query(`
            UPDATE "observation_entity" SET "extractor" = '${newId}'
            WHERE "extractor" = '${oldId}'
        `);
      if (hasStatusTable) {
        await queryRunner.query(`
            DELETE FROM "extractor_status_entity"
            WHERE "extractorId" = '${newId}' AND EXISTS (
                SELECT 1 FROM "extractor_status_entity" "old"
                WHERE "old"."extractorId" = '${oldId}'
                AND "old"."scannerId" = "extractor_status_entity"."scannerId"
                AND "old"."updateHeight" < "extractor_status_entity"."updateHeight"
            )
        `);
        await queryRunner.query(`
            UPDATE "extractor_status_entity" SET "extractorId" = '${newId}'
            WHERE "extractorId" = '${oldId}' AND NOT EXISTS (
                SELECT 1 FROM "extractor_status_entity" "renamed"
                WHERE "renamed"."extractorId" = '${newId}'
                AND "renamed"."scannerId" = "extractor_status_entity"."scannerId"
            )
        `);
        await queryRunner.query(`
            DELETE FROM "extractor_status_entity" WHERE "extractorId" = '${oldId}'
        `);
      }
    }
  }

  /**
   * old ids can not be restored since multiple old ids are merged into one
   */
  public async down(): Promise<void> {
    return;
  }
}
