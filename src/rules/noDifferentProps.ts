import {getCachedSelectorCreatorOptions} from '../utils/getCachedSelectorCreatorOptions';
import {getKeySelector} from '../utils/getKeySelector';
import {areParametersDifferent} from '../utils/areParametersDifferent';
import {getPropSelectorText} from '../utils/getPropSelectorText';
import {isCachedSelectorCreator} from '../utils/isCachedSelectorCreator';
import {getParametersFromProps} from '../utils/getParametersFromProps';
import {getImportFix} from '../utils/getImportFix';
import {getSelectorProps} from '../utils/getSelectorProps';
import {getCachedSelectorProps} from '../utils/getCachedSelectorProps';
import {getCommaTokenFix} from '../utils/getCommaTokenFix';
import {getKeySelectorFix} from '../utils/getKeySelectorFix';
import {AST_NODE_TYPES, TSESLint} from '@typescript-eslint/utils';
import {getParserServices} from "@typescript-eslint/utils/eslint-utils";

type MessageIds = 'different-props';
type Options = [];

type IRule = TSESLint.RuleModule<MessageIds, Options>;

export enum Errors {
    DifferentProps = 'different-props',
}

const meta: IRule['meta'] = {
    docs: {
        description: 'Cached selector and key selector must have same props.',
    },
    fixable: 'code',
    messages: {
        [Errors.DifferentProps]: 'Cached selector and key selector must have same props. selector parameters = {{selectorParameters}}, key selector parameters = {{keySelectorParameters}}',
    },
    schema: [
        {
            type: 'object',
            properties: {
                composer: {
                    type: 'string',
                },
            },
        },
    ],
    type: 'problem',
};

const create: IRule['create'] = context => {
    const composer = 'stringComposeKeySelectors';

    const sourceCode = context.sourceCode;
    const {esTreeNodeToTSNodeMap, program} = getParserServices(
        context,
    );
    const typeChecker = program.getTypeChecker();

    return {
        CallExpression(callExpression) {
            const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

            if (isCachedSelectorCreator(tsNode, typeChecker)) {
                const cachedOptions = getCachedSelectorCreatorOptions(
                    tsNode,
                    typeChecker,
                );
                const keySelector = getKeySelector(cachedOptions);

                if (keySelector && keySelector.valueDeclaration) {
                    const keySelectorType = typeChecker.getTypeOfSymbolAtLocation(
                        keySelector,
                        keySelector.valueDeclaration,
                    );
                    const keySelectorProps = getSelectorProps(
                        keySelectorType,
                        typeChecker,
                    );
                    const cachedSelectorProps = getCachedSelectorProps(
                        tsNode,
                        typeChecker,
                    );

                    const selectorParameters = getParametersFromProps(
                        cachedSelectorProps,
                        typeChecker,
                    );
                    const keySelectorParameters = getParametersFromProps(
                        keySelectorProps,
                        typeChecker,
                    );

                    if (
                        areParametersDifferent(selectorParameters, keySelectorParameters)
                    ) {
                        const selectorParametersString = selectorParameters
                            .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                            .join(';');

                        const keySelectorParametersString = keySelectorParameters
                            .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                            .join(';');

                        context.report({
                            messageId: Errors.DifferentProps,
                            node: callExpression.arguments[0],
                            data: {
                                selectorParameters: `{${selectorParametersString}}`,
                                keySelectorParameters: `{${keySelectorParametersString}}`,
                            },
                            fix(fixer: any) {
                                const argument = callExpression.arguments[0];

                                const propSelectors = selectorParameters.map(
                                    getPropSelectorText,
                                );
                                const isComposedSelector = propSelectors.length > 1;
                                const isDefaultKeySelector = propSelectors.length === 0;
                                const composedPropSelector = isComposedSelector
                                    ? `${composer}(\n        ${propSelectors.join(',\n        ')}\n    )`
                                    : propSelectors[0] ?? 'defaultKeySelector';

                                if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                                    const commaTokenFix = getCommaTokenFix(
                                        fixer,
                                        argument,
                                        sourceCode,
                                    );

                                    const keySelectorFix = getKeySelectorFix(
                                        fixer,
                                        argument,
                                        sourceCode,
                                        composedPropSelector,
                                    );

                                    const specifierNames = ['createPropSelector'];
                                    if (isComposedSelector) {
                                        specifierNames.push(composer);
                                    }
                                    if (isDefaultKeySelector) {
                                        specifierNames.push('defaultKeySelector');
                                    }

                                    const importFix = getImportFix(
                                        fixer,
                                        callExpression,
                                        'reselect-kit',
                                        specifierNames,
                                    );

                                    return [commaTokenFix, keySelectorFix, importFix];
                                }

                                return null;
                            },
                        });
                    }
                }
            }
        },
    };
}

export const noDifferentPropsRule: IRule = {
    meta,
    create,
    defaultOptions: [],
};
