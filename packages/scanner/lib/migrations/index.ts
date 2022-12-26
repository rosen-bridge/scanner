import { networkModelMigration1656073919399 } from './sqlite/networkModelMigration1656073919399';
import { blockExtraField1669194967067 } from './sqlite/blockExtraField1669194967067';
import { networkModelMigration1671715090347 } from './postgres/networkModelMigration1671715090347';
import { blockExtraField1671715062412 } from './postgres/blockExtraField1671715062412';

export const migrations = {
  sqlite: [networkModelMigration1656073919399, blockExtraField1669194967067],
  postgres: [networkModelMigration1671715090347, blockExtraField1671715062412],
};
