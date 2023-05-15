import { TxIdEntity1683960673259 } from './sqlite/1683960673259-tx-id-entity';
import { TxIdEntity1683960694422 } from './postgres/1683960694422-tx-id-entity';

export const migrations = {
  sqlite: [TxIdEntity1683960673259],
  postgres: [TxIdEntity1683960694422],
};
