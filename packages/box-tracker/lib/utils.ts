import { ApiRegister } from './config';

export const mapAdditionalRegisters = (
  apiRegisters: Record<string, ApiRegister> = {},
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key in apiRegisters) {
    const reg = apiRegisters[key];
    if (typeof reg === 'string') {
      result[key] = reg;
    } else {
      result[key] = reg.renderedValue ?? reg.serializedValue ?? '';
    }
  }
  return result;
};
