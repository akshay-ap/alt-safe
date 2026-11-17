import { LogoType, type TransactionGroupSpec } from "../context/types";

/** One template ("protocol") and the actions it offers; tag and logo come from the template. */
export type ActionSection = { group: string; actions: string[]; tag?: string; logo?: string };

/** Not a template: the free-form ABI encoder, always offered last. */
export const ENCODE_FUNCTION_CALL: ActionSection = { group: "Custom call", actions: ["Function call"], tag: "Other" };

const DISPLAY_NAMES: Record<string, string> = { Native: "Native token", Settings: "Safe settings" };

/** Template names are ids in URLs; a few read better with a clearer label on screen. */
export const protocolLabel = (group: string) => DISPLAY_NAMES[group] ?? group;

export type ProtocolGroup = { heading: string; sections: ActionSection[] };

/** Tokens first (the most common start), then DeFi, then everything else so no template can disappear. */
export const groupProtocols = (sections: ActionSection[]): ProtocolGroup[] => {
  const byTag = (tag: string) => sections.filter((section) => section.tag === tag);
  const rest = sections.filter((section) => section.tag !== "Token" && section.tag !== "DeFi");
  return [
    { heading: "Tokens", sections: byTag("Token") },
    { heading: "DeFi", sections: byTag("DeFi") },
    { heading: "Safe & advanced", sections: rest },
  ].filter((group) => group.sections.length > 0);
};

// Chain ID 0 in a template means "every chain".
const isAvailable = (spec: TransactionGroupSpec, chainId: number | undefined) =>
  spec.chainIds.includes(0) || (chainId !== undefined && spec.chainIds.includes(chainId));

const matchSection = (section: ActionSection, query: string): ActionSection | undefined => {
  // Cards show the label, so "Safe settings" has to find the template named "Settings".
  const names = [section.group, protocolLabel(section.group)];
  if (!query || names.some((name) => name.toLowerCase().includes(query))) return section;
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
      .map((spec) => ({
        group: spec.groupName,
        actions: spec.actions.map((action) => action.name),
        tag: spec.tags?.[0] ?? "Other",
        logo: spec.logo?.type === LogoType.CHARACTER ? spec.logo.value : undefined,
      })),
    ENCODE_FUNCTION_CALL,
  ];
  return sections
    .map((section) => matchSection(section, normalized))
    .filter((section): section is ActionSection => section !== undefined);
};
