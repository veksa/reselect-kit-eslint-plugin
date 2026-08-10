import ts from 'typescript';

/**
 * Optionality is a property of the symbol, not of the syntax that produced it.
 * A prop synthesized by a mapped type - `Partial<Props>` being the common one -
 * has no `PropertySignature` with a question token behind it, so inspecting the
 * declaration would report it as required and the rule would flag a key
 * selector that matches it perfectly.
 */
export const isPropOptional = (prop: ts.Symbol) =>
  ((prop.flags ?? 0) & ts.SymbolFlags.Optional) !== 0;
