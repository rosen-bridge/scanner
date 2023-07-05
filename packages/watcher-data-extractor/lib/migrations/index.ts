import { migration1688554842087 } from './postgres/1688554842087-migration';
import { migration1688555766601 } from './sqlite/1688555766601-migration';

export const migrations = {
  sqlite: [migration1688555766601],
  postgres: [migration1688554842087],
};
