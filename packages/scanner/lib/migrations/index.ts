import { networkModelMigration1656073919399 } from './sqlite/networkModelMigration1656073919399';
import { blockExtraField1669194967067 } from './sqlite/blockExtraField1669194967067';
import { timestamp1685981250354 } from './sqlite/timestamp1685981250354';
import { networkModelMigration1673692133524 } from './postgres/networkModelMigration1673692133524';
import { timestamp1685981061291 } from './postgres/timestamp1685981061291';

export const migrations = {
  sqlite: [
    networkModelMigration1656073919399,
    blockExtraField1669194967067,
    timestamp1685981250354,
  ],
  postgres: [networkModelMigration1673692133524, timestamp1685981061291],
};
