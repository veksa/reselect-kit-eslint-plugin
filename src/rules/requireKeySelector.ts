import { AST_NODE_TYPES, ESLintUtils, TSESLint } from '@typescript-eslint/utils';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelector';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';
import { getImportFix } from '../utils/getImportFix';
import { getCommaTokenFix } from '../utils/getCommaTokenFix';
import { getKeySelectorFix } from '../utils/getKeySelectorFix';

type MessageIds = 'key-selector-is-missing';
type Options = [];

type IRule = TSESLint.RuleModule<MessageIds, Options>;

export enum Errors {
  KeySelectorIsMissing = 'key-selector-is-missing',
}

const meta: IRule['meta'] = {
  docs: {
    description: 'Cached selector can`t work without key selector.',
  },
  fixable: 'code',
  messages: {
    [Errors.KeySelectorIsMissing]: 'Cached selector can`t work without key selector.',
  },
  schema: [],
  type: 'problem',
};

const create: IRule['create'] = (context) => {
  const sourceCode = context.sourceCode;
  const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(context);
  const typeChecker = program.getTypeChecker();

  return {
    CallExpression(callExpression) {
      const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

      if (isCachedSelectorCreator(tsNode, typeChecker)) {
        const cachedOptions = getCachedSelectorCreatorOptions(tsNode, typeChecker);
        const keySelector = getKeySelector(cachedOptions);

        if (keySelector === undefined) {
          context.report({
            messageId: Errors.KeySelectorIsMissing,
            node: callExpression.arguments[0],
            fix(fixer) {
              const argument = callExpression.arguments[0];

              const defaultKeySelector = `defaultKeySelector`;

              if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                const commaTokenFix = getCommaTokenFix(fixer, argument, sourceCode);

                const keySelectorFix = getKeySelectorFix(
                  fixer,
                  argument,
                  sourceCode,
                  defaultKeySelector,
                );

                const importFix = getImportFix(fixer, callExpression, 'reselect-kit', [
                  'defaultKeySelector',
                ]);

                return [commaTokenFix, keySelectorFix, importFix];
              }

              return null;
            },
          });
        }
      }
    },
  };
};

export const requireKeySelectorRule: IRule = {
  meta,
  create,
  defaultOptions: [],
};
