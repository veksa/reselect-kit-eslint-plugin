import ts from 'typescript';

const cachedSelectorCreators = [
    'createCachedSelector',
    'createCachedStructuredSelector',
    'createCachedSequenceSelector',
];

/**
 * Name the callee was declared with, following re-exports.
 *
 * Projects routinely funnel the creators through a barrel module and shorten
 * them on the way out (`createCachedStructuredSelector as cachedStruct`), so
 * matching the identifier as written would silently skip those call sites.
 */
const getDeclaredName = (
    expression: ts.Expression,
    typeChecker: ts.TypeChecker,
): string | undefined => {
    const symbol = typeChecker.getSymbolAtLocation(expression);

    if (symbol === undefined) {
        return undefined;
    }

    if (symbol.flags & ts.SymbolFlags.Alias) {
        return typeChecker.getAliasedSymbol(symbol).getName();
    }

    return symbol.getName();
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
