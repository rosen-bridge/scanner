import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1747655941239 implements MigrationInterface {
  name = 'migration1747655941239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update block_entity table for cardano
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano' 
      WHERE scanner IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      )
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'bitcoin' 
      WHERE scanner IN (
        'bitcoin-esplora',
        'bitcoin-rpc'
      )
    `);

    await queryRunner.query(`
      UPDATE block_entity
    SET scanner = substr(scanner, 1, length(scanner) - length('-evm-rpc')) || '-evm'
      WHERE scanner Like '%-evm-rpc'
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'doge' 
      WHERE scanner IN (
        'doge-esplora',
        'doge-rpc'
      )
    `);

    // Update extractor_status_entity table for cardano
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'cardano' 
      WHERE scannerId IN (
        'cardano-BlockFrost',
        'cardano-graphql',
        'cardano-koios',
        'cardano-ogmios'
      )
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'bitcoin' 
      WHERE scannerId IN (
        'bitcoin-esplora',
        'bitcoin-rpc'
      )
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
  SET scannerId = substr(scannerId, 1, length(scannerId) - length('-evm-rpc')) || '-evm'
      WHERE scannerId LIKE '%-evm-rpc'
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'doge' 
      WHERE scannerId IN (
        'doge-esplora',
        'doge-rpc'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert block_entity table
    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'cardano-koios' 
      WHERE scanner = 'cardano'
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'bitcoin-esplora' 
      WHERE scanner = 'bitcoin'
    `);
    await queryRunner.query(`
      UPDATE block_entity
    SET scanner = substr(scanner, 1, length(scanner) - length('-evm')) || '-evm-rpc'
      WHERE scanner LIKE '%-evm'
    `);

    await queryRunner.query(`
      UPDATE block_entity 
      SET scanner = 'doge-esplora' 
      WHERE scanner = 'doge'
    `);

    // Revert extractor_status_entity table
    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'cardano-koios' 
      WHERE scannerId = 'cardano'
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'bitcoin-esplora' 
      WHERE scannerId = 'bitcoin'
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
    SET scannerId = substr(scannerId, 1, length(scannerId) - length('-evm')) || '-evm-rpc'
      WHERE scannerId LIKE '%-evm'
    `);

    await queryRunner.query(`
      UPDATE extractor_status_entity 
      SET scannerId = 'doge-esplora' 
      WHERE scannerId = 'doge'
    `);
  }
}
