import { migration1688554842087 } from './postgres/1688554842087-migration';
import { migration1689175974257 } from './postgres/1689175974257-migration';
import { migration1699874447928 } from './postgres/1699874447928-migration';
import { migration1706610773315 } from './postgres/1706610773315-migration';
import { Migration1709388482275 } from './postgres/1709388482275-migration';
import { Migration1737785036299 } from './postgres/1737785036299-migration';
import { migration1746354253000 } from './postgres/1746354253000-migration';
import { Migration1758958886549 } from './postgres/1758958886549-migration';
import { Migration1766843825000 } from './postgres/1766843825000-migration';
import { Migration1783425106904 } from './postgres/1783425106904-migration';
import { migration1688555766601 } from './sqlite/1688555766601-migration';
import { migration1689175103163 } from './sqlite/1689175103163-migration';
import { migration1699872205117 } from './sqlite/1699872205117-migration';
import { migration1706610773176 } from './sqlite/1706610773176-migration';
import { Migration1709388134975 } from './sqlite/1709388134975-migration';
import { Migration1737547743177 } from './sqlite/1737547743177-migration';
import { migration1746354254000 } from './sqlite/1746354254000-migration';
import { migration1761774736153 } from './sqlite/1761774736153-migration';
import { Migration1762768664031 } from './sqlite/1762768664031-migration';
import { Migration1766843824000 } from './sqlite/1766843824000-migration';
import { Migration1783430084020 } from './sqlite/1783430084020-migration';

export const migrations = {
  sqlite: [
    migration1688555766601,
    migration1689175103163,
    migration1699872205117,
    migration1706610773176,
    Migration1709388134975,
    Migration1737547743177,
    migration1746354254000,
    migration1761774736153,
    Migration1762768664031,
    Migration1766843824000,
    Migration1783430084020,
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
    Migration1766843825000,
    Migration1783425106904,
  ],
};
