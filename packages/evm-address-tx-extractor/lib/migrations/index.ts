import { Migration1713694851290 } from './postgres/1713694851290-migration';
import { Migration1722346608595 } from './postgres/1722346608595-migration';
import { Migration1713694799333 } from './sqlite/1713694799333-migration';
import { Migration1722346500068 } from './sqlite/1722346500068-migration';

export default {
  sqlite: [Migration1713694799333, Migration1722346500068],
  postgres: [Migration1713694851290, Migration1722346608595],
};
