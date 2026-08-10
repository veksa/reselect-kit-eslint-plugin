import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { getImportDeclaration } from './getImportDeclaration';

export const getImportFix = (
  fixer: TSESLint.RuleFixer,
  node: TSESTree.Node,
  sourceValue: string,
  specifierNames: string[],
) => {
  const importNode = getImportDeclaration(node, sourceValue);

  let existingSpecifierNames: string[] = [];
  let missingSpecifierNames = specifierNames;

  if (importNode) {
    existingSpecifierNames = importNode.specifiers.map((specifier) => specifier.local.name);

    missingSpecifierNames = specifierNames.filter((specifierName) => {
      return !existingSpecifierNames.includes(specifierName);
    });
  }

  const resultSpecifierNames = [...existingSpecifierNames, ...missingSpecifierNames];
  const specifiers = resultSpecifierNames.join(', ');
  const importText = `import {${specifiers}} from '${sourceValue}';`;

  if (importNode) {
    return fixer.replaceText(importNode, importText);
  }

  return fixer.insertTextBeforeRange([0, 0], `${importText}\n`);
};
