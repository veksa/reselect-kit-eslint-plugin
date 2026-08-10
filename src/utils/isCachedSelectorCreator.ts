import ts from 'typescript';

const cachedSelectorCreators = [
  'createCachedSelector',
  'createCachedStructuredSelector',
  'createCachedSequenceSelector',
];

/**
 * Symbol the callee ultimately refers to.
 *
 * Projects routinely funnel the creators through a barrel module and rename
 * them on the way out, either as an import alias
 * (`createCachedStructuredSelector as cachedStruct`) or by assigning them to a
 * fresh binding (`export const cachedStruct = createCachedStructuredSelector`).
 * Both hops have to be followed, or those call sites are silently skipped.
 */
const resolveDeclaredSymbol = (
  symbol: ts.Symbol,
  typeChecker: ts.TypeChecker,
  seen: Set<ts.Symbol>,
): ts.Symbol => {
  if (seen.has(symbol)) {
    return symbol;
  }
  seen.add(symbol);

  if (symbol.flags & ts.SymbolFlags.Alias) {
    return resolveDeclaredSymbol(typeChecker.getAliasedSymbol(symbol), typeChecker, seen);
  }

  const [declaration] = symbol.getDeclarations() ?? [];
  const initializer =
    declaration !== undefined && ts.isVariableDeclaration(declaration)
      ? declaration.initializer
      : undefined;

  if (initializer !== undefined && ts.isIdentifier(initializer)) {
    const initializerSymbol = typeChecker.getSymbolAtLocation(initializer);

    if (initializerSymbol !== undefined) {
      return resolveDeclaredSymbol(initializerSymbol, typeChecker, seen);
    }
  }

  return symbol;
};

const getDeclaredName = (
  expression: ts.Expression,
  typeChecker: ts.TypeChecker,
): string | undefined => {
  const symbol = typeChecker.getSymbolAtLocation(expression);

  if (symbol === undefined) {
    return undefined;
  }

  return resolveDeclaredSymbol(symbol, typeChecker, new Set()).getName();
};

export const isCachedSelectorCreator = (
  callExpression: ts.CallExpression,
  typeChecker: ts.TypeChecker,
) => {
  const leftHandSideExpression = callExpression.expression;

  if (ts.isCallExpression(leftHandSideExpression)) {
    const creator = leftHandSideExpression.expression;
    const declaredName = getDeclaredName(creator, typeChecker);

    return cachedSelectorCreators.includes(declaredName ?? creator.getText());
  }

  return false;
};
