import ts from 'typescript';

export const getKeySelector = (properties: ts.Symbol[]) => {
  return properties.find((property) => property.name === 'keySelector');
};
