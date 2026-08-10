import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isCommaToken } from '@typescript-eslint/utils/ast-utils';
import { RuleFixer, SourceCode } from '@typescript-eslint/utils/ts-eslint';

export const getCommaTokenFix = (
  fixer: RuleFixer,
  argument: TSESTree.ObjectExpression,
  sourceCode: SourceCode,
): TSESLint.RuleFix => {
  const emptyFix = fixer.insertTextBeforeRange([0, 0], ``);

  const lastProperty = argument.properties[argument.properties.length - 1];

  if (lastProperty === undefined) {
    return emptyFix;
  }

  const lastToken = sourceCode.getTokenAfter(lastProperty);

  if (lastToken && isCommaToken(lastToken)) {
    return emptyFix;
  }

  return fixer.insertTextAfter(lastProperty, `,`);
};
