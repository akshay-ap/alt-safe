/** Current network first, then networks with a saved RPC, then the rest; each keeps its original order. */
export const orderChainsForRpcList = <T extends { id: number }>(
  chains: readonly T[],
  savedChainIds: ReadonlySet<number>,
  currentChainId: number,
): T[] => {
  const rank = (chain: T) => (chain.id === currentChainId ? 0 : savedChainIds.has(chain.id) ? 1 : 2);
  // Array.prototype.sort is stable, so ties keep the supported-chains order.
  return [...chains].sort((a, b) => rank(a) - rank(b));
};
