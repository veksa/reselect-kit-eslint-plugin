import ts from 'typescript';
import { isPropOptional } from './isPropOptional';

export const unknownPropType = 'unknownPropType';

export type ParameterInfo = {
  name: string;
  type: ts.Type | undefined;
  typeString: string;
  isOptional: boolean;
};

export const getParametersFromProps = (
  props: ts.Symbol[],
  typeChecker: ts.TypeChecker,
): ParameterInfo[] => {
  return props.map((prop) => {
    const { name } = prop;

    const [declaration] = prop.getDeclarations() ?? [];

    // The type has to be read off the symbol rather than off its declaration:
    // a property coming from an instantiated generic (`Props<number>`) is
    // still written `value: T`, so reading the node yields the uninstantiated
    // type parameter - and the fix would emit `createPropSelector<{value: T}>()`
    // naming a `T` that is not in scope at the call site.
    const propType = declaration
      ? typeChecker.getTypeOfSymbolAtLocation(prop, declaration)
      : undefined;

    const typeString = propType ? typeChecker.typeToString(propType) : unknownPropType;

    const isOptional = isPropOptional(prop);

    return {
      name,
      type: propType,
      typeString,
      isOptional,
    };
  });
};
