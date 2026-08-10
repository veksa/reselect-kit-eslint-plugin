import { ParameterInfo } from './getParametersFromProps';

export const areParametersDifferent = (
  selectorParameters: ParameterInfo[],
  keySelectorParameters: ParameterInfo[],
) => {
  if (selectorParameters.length !== keySelectorParameters.length) {
    return true;
  }

  return selectorParameters.some((selectorProperty) => {
    return !keySelectorParameters.find((keySelectorProperty) => {
      return (
        selectorProperty.name === keySelectorProperty.name &&
        selectorProperty.typeString === keySelectorProperty.typeString &&
        selectorProperty.isOptional === keySelectorProperty.isOptional
      );
    });
  });
};
