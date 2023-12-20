export const blockInfoVariables = (height: number) => ({
  where: {
    number: {
      _eq: height,
    },
  },
});

export const blockTxsVariables = (blockId: string) => ({
  where: {
    hash: {
      _eq: blockId,
    },
  },
});
