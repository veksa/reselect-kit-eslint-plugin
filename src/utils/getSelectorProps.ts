import ts from 'typescript';

export function getTypeArguments(
    type: ts.TypeReference,
    checker: ts.TypeChecker,
): readonly ts.Type[] {
    // getTypeArguments was only added in TS3.7
    if (checker.getTypeArguments) {
        return checker.getTypeArguments(type);
    }

    return type.typeArguments ?? [];
}

const isRestParameter = (parameter: ts.Symbol) => {
    const [declaration] = parameter.getDeclarations() ?? [];

    return declaration !== undefined
        && ts.isParameter(declaration)
        && declaration.dotDotDotToken !== undefined;
};

export const getSelectorProps = (
    selectorType: ts.Type,
    typeChecker: ts.TypeChecker,
) => {
    const [signature] = typeChecker.getSignaturesOfType(
        selectorType,
        ts.SignatureKind.Call,
    );
    if (signature === undefined) {
        return [];
    }

    const [, props] = signature.getParameters();
    if (props === undefined || props.valueDeclaration === undefined) {
        return [];
    }

    const nodeType = typeChecker.getTypeOfSymbolAtLocation(
        props,
        props.valueDeclaration,
    );

    // reselect and reselect-kit type the props as a rest parameter holding a
    // tuple: `(state: State, ...params: [props: Props]) => Result`. An empty
    // tuple means the selector accepts no props, so there is nothing to read -
    // falling back to the tuple itself would report Array.prototype as props.
    if (isRestParameter(props) || typeChecker.isTupleType(nodeType)) {
        const [params] = getTypeArguments(
            nodeType as ts.TypeReference,
            typeChecker,
        );

        return params === undefined ? [] : typeChecker.getPropertiesOfType(params);
    }

    // Hand written key selectors still declare props as a plain parameter,
    // e.g. `(state: State, props: Props) => Props['id']`.
    return typeChecker.getPropertiesOfType(nodeType);
};
