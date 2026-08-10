import { AST_NODE_TYPES, ASTUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

export const getKeySelectorFix = (
  fixer: TSESLint.RuleFixer,
  argument: TSESTree.ObjectExpression,
  sourceCode: TSESLint.SourceCode,
  keySelectorValue: string,
): TSESLint.RuleFix => {
  const keySelector = `keySelector: ${keySelectorValue}`;

  const firstToken = sourceCode.getFirstToken(argument);
  const lastToken = sourceCode.getLastToken(argument);
  const leadingLineBreak =
    firstToken && lastToken && ASTUtils.isTokenOnSameLine(firstToken, lastToken);

  const keySelectorProperty = argument.properties.find((property) => {
    return (
      property.type === AST_NODE_TYPES.Property &&
      property.key.type === AST_NODE_TYPES.Identifier &&
      property.key.name === 'keySelector'
    );
  });

  if (keySelectorProperty) {
    return fixer.replaceText(keySelectorProperty, keySelector);
  }

  return fixer.insertTextBeforeRange(
    [argument.range[1] - 1, argument.range[1] - 1],
    leadingLineBreak ? `\n    ${keySelector}\n` : `    ${keySelector}\n`,
  );
};
