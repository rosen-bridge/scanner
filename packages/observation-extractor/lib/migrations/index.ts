import { networkModelMigration1658414485911 } from './sqlite/networkModelMigration1658414485911';
import { networkModelMigration1671714613059 } from './postgres/networkModelMigration1671714613059';

export const migrations = {
  sqlite: [networkModelMigration1658414485911],
  postgres: [networkModelMigration1671714613059],
};
