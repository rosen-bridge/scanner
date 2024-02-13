export const bigintTransformer = {
  /**
   * converts data from string in database to bigint in code
   *
   * @param {string} value
   * @return {bigint}
   */
  from(value: string) {
    return BigInt(value);
  },
  /**
   * converts data from bigint in code to string in database
   *
   * @param {bigint} value
   * @return {string}
   */
  to(value: bigint) {
    return value.toString();
  },
};
