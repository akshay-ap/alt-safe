import { Parser } from "expr-eval";

export const createBigIntParser = () => {
  const parser = new Parser();

  // Add BigInt comparison functions
  parser.functions = {
    ...parser.functions,
    bigIntLte: (a: string, b: string) => BigInt(a) <= BigInt(b),
    bigIntGte: (a: string, b: string) => BigInt(a) >= BigInt(b),
    bigIntLt: (a: string, b: string) => BigInt(a) < BigInt(b),
    bigIntGt: (a: string, b: string) => BigInt(a) > BigInt(b),
    bigIntEq: (a: string, b: string) => BigInt(a) === BigInt(b),
    bigIntAdd: (a: string, b: string) => BigInt(a) + BigInt(b),
    bigIntSub: (a: string, b: string) => BigInt(a) - BigInt(b),
    bigIntMul: (a: string, b: string) => BigInt(a) * BigInt(b),
    bigIntDiv: (a: string, b: string) => BigInt(a) / BigInt(b),
  };

  return parser;
};
