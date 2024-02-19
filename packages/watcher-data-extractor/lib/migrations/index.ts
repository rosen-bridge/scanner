import { migration1688554842087 } from './postgres/1688554842087-migration';
import { migration1689175974257 } from './postgres/1689175974257-migration';
import { migration1699874447928 } from './postgres/1699874447928-migration';
import { migration1706610773315 } from './postgres/1706610773315-migration';
import { Migration1708189757400 } from './postgres/1708189757400-migration';
import { migration1688555766601 } from './sqlite/1688555766601-migration';
import { migration1689175103163 } from './sqlite/1689175103163-migration';
import { migration1699872205117 } from './sqlite/1699872205117-migration';
import { migration1706610773176 } from './sqlite/1706610773176-migration';
import { Migration1708175020320 } from './sqlite/1708175020320-migration';

export const migrations = {
  sqlite: [
    migration1688555766601,
    migration1689175103163,
    migration1699872205117,
    Migration1708175020320,
    migration1706610773176,
  ],
  postgres: [
    migration1688554842087,
    migration1689175974257,
    migration1699874447928,
    Migration1708189757400,
    migration1706610773315,
  ],
};
