import { migration1693308311652 } from './postgres/1693308311652-migration';
import { Migration1766229066209 } from './postgres/1766229066209-migration';
import { Migration1791275497814 } from './postgres/1791275497814-migration';
import { migration1693122371215 } from './sqlite/1693122371215-migration';
import { Migration1766226220592 } from './sqlite/1766226220592-migration';
import { Migration1791275463652 } from './sqlite/1791275463652-migration';

export const migrations = {
  sqlite: [
    migration1693122371215,
    Migration1766226220592,
    Migration1791275463652,
  ],
  postgres: [
    migration1693308311652,
    Migration1766229066209,
    Migration1791275497814,
  ],
};
