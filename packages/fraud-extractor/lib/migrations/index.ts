import { migration1693308311652 } from './postgres/1693308311652-migration';
import { Migration1766229066209 } from './postgres/1766229066209-migration';
import { migration1693122371215 } from './sqlite/1693122371215-migration';
import { Migration1766226220592 } from './sqlite/1766226220592-migration';

export const migrations = {
  sqlite: [migration1693122371215, Migration1766226220592],
  postgres: [migration1693308311652, Migration1766229066209],
};
