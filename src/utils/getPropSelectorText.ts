import { ParameterInfo } from './getParametersFromProps';

export const getPropSelectorText = (selectorParameters: ParameterInfo) => {
  const { name, typeString, isOptional } = selectorParameters;

  return isOptional
    ? `createPropSelector<{ ${name}?: ${typeString} }>().${name}()`
    : `createPropSelector<{ ${name}: ${typeString} }>().${name}()`;
};
