import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { getParent } from './getParent';

export const getImportDeclaration = (
  node: TSESTree.Node,
  sourceValue: string,
): TSESTree.ImportDeclaration | undefined => {
  const program = getParent(node, (current): current is TSESTree.Program => {
    return current.type === AST_NODE_TYPES.Program;
  });

  if (program) {
    return program.body.find((statement): statement is TSESTree.ImportDeclaration => {
      return (
        statement.type === AST_NODE_TYPES.ImportDeclaration &&
        statement.source.value === sourceValue
      );
    });
  }

  return undefined;
};
