import { Migration1713694851290 } from './postgres/1713694851290-migration';
import { Migration1713694799333 } from './sqlite/1713694799333-migration';

export default {
  sqlite: [Migration1713694799333],
  postgres: [Migration1713694851290],
};
