import { ApiRegister } from './interfaces';

/**
 * Maps Ergo API register objects into a normalized key-value record.
 * @param apiRegisters - A record of API register objects.
 * @return A record with register keys and their corresponding string values.
 */
export const mapAdditionalRegisters = (
  apiRegisters: Record<string, ApiRegister> = {},
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key in apiRegisters) {
    const reg = apiRegisters[key];
    if (typeof reg === 'string') {
      result[key] = reg;
    } else {
      result[key] = reg.renderedValue || reg.serializedValue || '';
    }
  }
  return result;
};
