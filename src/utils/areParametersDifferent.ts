import ts from 'typescript';
import { ParameterInfo } from './getParametersFromProps';

const isAny = (type: ts.Type) => (type.flags & ts.TypeFlags.Any) !== 0;

/**
 * Two prop types are the same when each is assignable to the other.
 *
 * Comparing what `typeToString` prints instead would flag props that are the
 * very same type: an alias is printed by its name, so `Status` reads as
 * different from `'active' | 'closed'`, and an intersection is printed in the
 * order it was written, so `M1 & M2` reads as different from `M2 & M1`.
 *
 * `any` is the one type mutual assignability cannot tell apart from anything
 * else, and losing `{id: any}` against `{id: number}` would hide exactly the
 * kind of key selector this rule exists to catch - so it is compared on its own
 * before assignability gets a say.
 */
const areTypesEqual = (
  selectorProperty: ParameterInfo,
  keySelectorProperty: ParameterInfo,
  typeChecker: ts.TypeChecker,
) => {
  const { type: selectorType } = selectorProperty;
  const { type: keySelectorType } = keySelectorProperty;

  // A prop whose type the checker could not resolve carries no type to compare,
  // and both sides fall back to the same placeholder.
  if (selectorType === undefined || keySelectorType === undefined) {
    return selectorProperty.typeString === keySelectorProperty.typeString;
  }

  if (isAny(selectorType) !== isAny(keySelectorType)) {
    return false;
  }

  return (
    typeChecker.isTypeAssignableTo(selectorType, keySelectorType) &&
    typeChecker.isTypeAssignableTo(keySelectorType, selectorType)
  );
};

export const areParametersDifferent = (
  selectorParameters: ParameterInfo[],
  keySelectorParameters: ParameterInfo[],
  typeChecker: ts.TypeChecker,
) => {
  if (selectorParameters.length !== keySelectorParameters.length) {
    return true;
  }

  return selectorParameters.some((selectorProperty) => {
    return !keySelectorParameters.find((keySelectorProperty) => {
      return (
        selectorProperty.name === keySelectorProperty.name &&
        selectorProperty.isOptional === keySelectorProperty.isOptional &&
        areTypesEqual(selectorProperty, keySelectorProperty, typeChecker)
      );
    });
  });
};
