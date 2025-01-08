import { TestAbstractExtractor } from './TestAbstractExtractor.spec';

describe('AbstractExtractor', () => {
  /**
   * @target AbstractExtractor.callCallbacks should call all registered callbacks
   * @dependencies
   * @scenario
   * - mock extractor
   * - register two mocked callbacks
   * - run test
   * @expected
   * - two callbacks should have been called once
   */
  it(`should call all registered callbacks`, async () => {
    const extractor = new TestAbstractExtractor();
    const callback1 = vi.fn().mockImplementation(async () => {
      undefined;
    });
    extractor.registerCallback(`callback-id-1`, callback1);
    const callback2 = vi.fn().mockImplementation(async () => {
      undefined;
    });
    extractor.registerCallback(`callback-id-2`, callback2);
    extractor.callCallbacks();
    expect(callback1).toHaveBeenCalledOnce();
    expect(callback2).toHaveBeenCalledOnce();
  });

  /**
   * @target AbstractExtractor.callCallbacks should catch callback error
   * @dependencies
   * @scenario
   * - mock extractor
   * - register a mocked callback that throws error
   * - run test
   * @expected
   * - callback should have been called
   */
  it(`should catch callback error`, async () => {
    const extractor = new TestAbstractExtractor();
    const callback = vi.fn().mockImplementation(async () => {
      throw Error(`Test Error`);
    });
    extractor.registerCallback(`callback-id`, callback);
    extractor.callCallbacks();
    expect(callback).toHaveBeenCalledOnce();
  });
});
