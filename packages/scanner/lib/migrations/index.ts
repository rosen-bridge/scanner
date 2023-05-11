import { networkModelMigration1656073919399 } from './sqlite/networkModelMigration1656073919399';
import { blockExtraField1669194967067 } from './sqlite/blockExtraField1669194967067';
import { networkModelMigration1673692133524 } from './postgres/networkModelMigration1673692133524';

export const migrations = {
  sqlite: [networkModelMigration1656073919399, blockExtraField1669194967067],
  postgres: [networkModelMigration1673692133524],
};
