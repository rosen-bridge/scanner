import { mapAdditionalRegisters } from '../lib/utils';
import { ApiRegister } from '../lib/interfaces';

describe('mapAdditionalRegisters', () => {
  /**
   * @target mapAdditionalRegisters should convert explorer registers to rendered values
   * @scenario
   * - provide explorer-like registers
   * - call mapAdditionalRegisters
   * @expected
   * - returned record should contain renderedValue strings
   */
  it('should convert explorer registers to rendered values', () => {
    const explorerRegs: Record<string, ApiRegister> = {
      R4: {
        serializedValue: '0e020101',
        sigmaType: 'Coll[Byte]',
        renderedValue: '01',
      },
      R5: {
        serializedValue: '0e020202',
        sigmaType: 'Coll[Byte]',
        renderedValue: '02',
      },
    };

    const mapped = mapAdditionalRegisters(explorerRegs);
    expect(mapped).toEqual({
      R4: '01',
      R5: '02',
    });
  });

  /**
   * @target mapAdditionalRegisters should fallback to serializedValue when renderedValue is empty
   * @scenario
   * - provide explorer-like register with empty renderedValue
   * - call mapAdditionalRegisters
   * @expected
   * - returned record should use serializedValue instead
   */
  it('should fallback to serializedValue when renderedValue is empty', () => {
    const register: Record<string, ApiRegister> = {
      R4: {
        serializedValue: '0e02abcd',
        sigmaType: 'Coll[Byte]',
        renderedValue: '',
      },
    };

    const mapped = mapAdditionalRegisters(register);
    expect(mapped).toEqual({
      R4: '0e02abcd',
    });
  });

  /**
   * @target mapAdditionalRegisters should handle node registers as plain strings
   * @scenario
   * - provide node-like registers
   * - call mapAdditionalRegisters
   * @expected
   * - returned record should contain the same hex strings
   */
  it('should handle node registers as plain strings', () => {
    const nodeRegs: Record<string, ApiRegister> = {
      R4: '0e020101',
      R5: '0e020202',
    };

    const mapped = mapAdditionalRegisters(nodeRegs);
    expect(mapped).toEqual({
      R4: '0e020101',
      R5: '0e020202',
    });
  });

  /**
   * @target mapAdditionalRegisters should return empty object on empty input
   * @scenario
   * - call mapAdditionalRegisters without arguments
   * @expected
   * - returned record should be {}
   */
  it('should return empty object on empty input', () => {
    const mapped = mapAdditionalRegisters();
    expect(mapped).toEqual({});
  });
});
