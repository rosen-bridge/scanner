import { migration1688554842087 } from './postgres/1688554842087-migration';
import { migration1689175974257 } from './postgres/1689175974257-migration';
import { migration1699874447928 } from './postgres/1699874447928-migration';
import { migration1706610773315 } from './postgres/1706610773315-migration';
import { Migration1709388482275 } from './postgres/1709388482275-migration';
import { Migration1737785036299 } from './postgres/1737785036299-migration';
import { migration1746354253000 } from './postgres/1746354253000-migration';
import { Migration1758958886549 } from './postgres/1758958886549-migration';
import { migration1688555766601 } from './sqlite/1688555766601-migration';
import { migration1689175103163 } from './sqlite/1689175103163-migration';
import { migration1699872205117 } from './sqlite/1699872205117-migration';
import { migration1706610773176 } from './sqlite/1706610773176-migration';
import { Migration1709388134975 } from './sqlite/1709388134975-migration';
import { Migration1737547743177 } from './sqlite/1737547743177-migration';
import { migration1746354254000 } from './sqlite/1746354254000-migration';
import { Migration1758439835359 } from './sqlite/1758439835359-migration';

export const migrations = {
  sqlite: [
    migration1688555766601,
    migration1689175103163,
    migration1699872205117,
    migration1706610773176,
    Migration1709388134975,
    Migration1737547743177,
    migration1746354254000,
    Migration1758439835359,
  ],
  postgres: [
    migration1688554842087,
    migration1689175974257,
    migration1699874447928,
    migration1706610773315,
    Migration1709388482275,
    Migration1737785036299,
    migration1746354253000,
    Migration1758958886549,
  ],
};
