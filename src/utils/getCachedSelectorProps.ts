import ts from 'typescript';
import {getSelectorProps, getTypeArguments} from './getSelectorProps';

/**
 * Props the cached selector requires on its own.
 *
 * Reading them back from the built selector does not work: its type intersects
 * the props of the input selectors with the props of the key selector that was
 * passed in, so a mismatching key selector would look like a prop the selector
 * itself declares and the rule could never flag it.
 *
 * The creator call keeps the untouched value as the default of its `KeyParams`
 * type parameter - `<KeyParams extends readonly any[] = [props: Props]>(...)` -
 * which is what every cached selector creator of reselect-kit and re-reselect
 * is typed with.
 */
export const getCachedSelectorProps = (
    callExpression: ts.CallExpression,
    typeChecker: ts.TypeChecker,
): ts.Symbol[] => {
    const creatorType = typeChecker.getTypeAtLocation(callExpression.expression);

    const [signature] = typeChecker.getSignaturesOfType(
        creatorType,
        ts.SignatureKind.Call,
    );
    const [keyParams] = signature?.getTypeParameters() ?? [];

    const defaultType = keyParams
        ? typeChecker.getDefaultFromTypeParameter(keyParams)
        : undefined;

    if (defaultType) {
        const [props] = getTypeArguments(
            defaultType as ts.TypeReference,
            typeChecker,
        );

        return props === undefined ? [] : typeChecker.getPropertiesOfType(props);
    }

    // Typings that do not carry the props on the creator still expose them on
    // the built selector.
    return getSelectorProps(
        typeChecker.getTypeAtLocation(callExpression),
        typeChecker,
    );
};
