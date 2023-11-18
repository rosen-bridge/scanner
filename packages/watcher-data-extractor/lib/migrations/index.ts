import { migration1688554842087 } from './postgres/1688554842087-migration';
import { migration1689175974257 } from './postgres/1689175974257-migration';
import { migration1699874447928 } from './postgres/1699874447928-migration';
import { migration1688555766601 } from './sqlite/1688555766601-migration';
import { migration1689175103163 } from './sqlite/1689175103163-migration';
import { migration1699872205117 } from './sqlite/1699872205117-migration';

export const migrations = {
  sqlite: [
    migration1688555766601,
    migration1689175103163,
    migration1699872205117,
  ],
  postgres: [
    migration1688554842087,
    migration1689175974257,
    migration1699874447928,
  ],
};
