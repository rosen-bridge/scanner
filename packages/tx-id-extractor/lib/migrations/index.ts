import { migration1688546418507 } from './postgres/1688546418507-migration';
import { migration1688555717186 } from './sqlite/1688555717186-migration';

export const migrations = {
  sqlite: [migration1688555717186],
  postgres: [migration1688546418507],
};
