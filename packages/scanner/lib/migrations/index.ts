import { migration1688545690867 } from './postgres/1688545690867-migration';
import { migration1713803486477 } from './postgres/1713803486477-migration';
import { migration1718789786123 } from './postgres/1718789786123-migration';
import { migration1722697954558 } from './postgres/1722697954558-migration';
import { migration1746701087567 } from './postgres/1746701087567-migration';
import { migration1688555497475 } from './sqlite/1688555497475-migration';
import { migration1713786682123 } from './sqlite/1713786682123-migration';
import { migration1718789744123 } from './sqlite/1718789744123-migration';
import { migration1722697111974 } from './sqlite/1722697111974-migration';
import { migration1746701087234 } from './sqlite/1746701087234-migration';

export const migrations = {
  sqlite: [
    migration1688555497475,
    migration1713786682123,
    migration1718789744123,
    migration1722697111974,
    migration1746701087234,
  ],
  postgres: [
    migration1688545690867,
    migration1713803486477,
    migration1718789786123,
    migration1722697954558,
    migration1746701087567,
  ],
};
