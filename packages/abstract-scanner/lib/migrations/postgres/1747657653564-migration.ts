import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1747657653564 implements MigrationInterface {
  name = 'migration1747657653564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // block_entity updates
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano' 
      WHERE scanner IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      );
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'bitcoin' 
      WHERE scanner IN (
        'bitcoin-esplora',
        'bitcoin-rpc'
      );
    `);

    await queryRunner.query(`
      UPDATE block_entity
      SET scanner = 'ethereum'
      WHERE scanner = 'ethereum-evm-rpc';
    `);

    await queryRunner.query(`
      UPDATE block_entity
      SET scanner = 'binance'
      WHERE scanner = 'binance-evm-rpc';
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'doge' 
      WHERE scanner IN (
        'doge-esplora',
        'doge-rpc'
      );
    `);

    // extractor_status_entity updates
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'cardano' 
      WHERE "scannerId" IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      );
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'bitcoin' 
      WHERE "scannerId" IN (
        'bitcoin-esplora',
        'bitcoin-rpc'
      );
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity
      SET "scannerId" = 'ethereum'
      WHERE "scannerId" = 'ethereum-evm-rpc';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity
      SET "scannerId" = 'binance'
      WHERE "scannerId" = 'binance-evm-rpc';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'doge' 
      WHERE "scannerId" IN (
        'doge-esplora',
        'doge-rpc'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert block_entity
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano-koios' 
      WHERE scanner = 'cardano';
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'bitcoin-esplora' 
      WHERE scanner = 'bitcoin';
    `);

    await queryRunner.query(`
      UPDATE block_entity
      SET scanner = 'ethereum-evm-rpc'
      WHERE scanner = 'ethereum-evm';
    `);

    await queryRunner.query(`
      UPDATE block_entity
      SET scanner = 'binance-evm-rpc'
      WHERE scanner = 'binance-evm';
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'doge-esplora' 
      WHERE scanner = 'doge';
    `);

    // Revert extractor_status_entity
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'cardano-koios' 
      WHERE "scannerId" = 'cardano';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'bitcoin-esplora' 
      WHERE "scannerId" = 'bitcoin';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity
      SET "scannerId" = 'ethereum-evm-rpc'
      WHERE "scannerId" = 'ethereum';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity
      SET "scannerId" = 'binance-evm-rpc'
      WHERE "scannerId" = 'binance';
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET "scannerId" = 'doge-esplora' 
      WHERE "scannerId" = 'doge';
    `);
  }
}
