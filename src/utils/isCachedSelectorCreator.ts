import ts from 'typescript';

const cachedSelectorCreators = [
  'createCachedSelector',
  'createCachedStructuredSelector',
  'createCachedSequenceSelector',
  // re-reselect names its structured creator the other way round.
  'createStructuredCachedSelector',
];

/**
 * `createCachedSelector.withTypes<State>()` hands back the same creator with
 * the state pre-typed. That call has no symbol of its own, so a call site going
 * through it resolves to nothing and would be skipped entirely - silently, and
 * for every rule. Unwrapping it back to the creator it was built from covers
 * both spellings: used inline, and stored in a binding first.
 */
const unwrapWithTypes = (expression: ts.Expression): ts.Expression => {
  if (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === 'withTypes'
  ) {
    return unwrapWithTypes(expression.expression.expression);
  }

  return expression;
};

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
  const source = initializer === undefined ? undefined : unwrapWithTypes(initializer);

  if (source !== undefined && ts.isIdentifier(source)) {
    const initializerSymbol = typeChecker.getSymbolAtLocation(source);

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
    const creator = unwrapWithTypes(leftHandSideExpression.expression);
    const declaredName = getDeclaredName(creator, typeChecker);

    return cachedSelectorCreators.includes(declaredName ?? creator.getText());
  }

  return false;
};
