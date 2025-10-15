import { JsonBigIntFactory } from '@rosen-bridge/json-bigint';

const JsonBI = JsonBigIntFactory({
  useNativeBigInt: true,
});

export { JsonBI };
