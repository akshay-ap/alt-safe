import type { TransactionGroupSpec } from "../context/types";

export type ActionSection = { group: string; actions: string[] };

/** Not a template: the free-form ABI encoder, always offered last. */
export const ENCODE_FUNCTION_CALL: ActionSection = { group: "Encode Function Call", actions: ["encodeFunctionCall"] };

// Chain ID 0 in a template means "every chain".
const isAvailable = (spec: TransactionGroupSpec, chainId: number | undefined) =>
  spec.chainIds.includes(0) || (chainId !== undefined && spec.chainIds.includes(chainId));

const matchSection = (section: ActionSection, query: string): ActionSection | undefined => {
  if (!query || section.group.toLowerCase().includes(query)) return section;
  const actions = section.actions.filter((action) => action.toLowerCase().includes(query));
  return actions.length > 0 ? { ...section, actions } : undefined;
};

/** The actions a user can add on this network, grouped by template and narrowed by a search query. */
export const buildActionCatalog = (
  specs: TransactionGroupSpec[],
  chainId: number | undefined,
  query: string,
): ActionSection[] => {
  const normalized = query.trim().toLowerCase();
  const sections = [
    ...specs
      .filter((spec) => isAvailable(spec, chainId))
      .map((spec) => ({ group: spec.groupName, actions: spec.actions.map((action) => action.name) })),
    ENCODE_FUNCTION_CALL,
  ];
  return sections
    .map((section) => matchSection(section, normalized))
    .filter((section): section is ActionSection => section !== undefined);
};
