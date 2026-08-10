import ts from 'typescript';
import { TSESTree } from '@typescript-eslint/utils';
import { getSelectorProps, getTypeArguments } from '../utils/getSelectorProps';
import { getCachedSelectorProps } from '../utils/getCachedSelectorProps';
import { getImportDeclaration } from '../utils/getImportDeclaration';
import {
  getParametersFromProps,
  unknownPropType,
  ParameterInfo,
} from '../utils/getParametersFromProps';
import { areParametersDifferent } from '../utils/areParametersDifferent';
import { isPropOptional } from '../utils/isPropOptional';
import { getKeySelector } from '../utils/getKeySelector';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';

const stubChecker = (overrides: object) => overrides as unknown as ts.TypeChecker;
const stubType = () => ({}) as ts.Type;
const stubSymbol = (overrides: object) => overrides as unknown as ts.Symbol;

// Everything below guards a defensive branch: the rules run against whatever
// the user typed, including code that does not type check, so the utils must
// degrade to "no props known" instead of throwing.
describe('getTypeArguments', () => {
  it('falls back to the type`s own arguments when the checker cannot resolve them', () => {
    const type = { typeArguments: [stubType()] } as unknown as ts.TypeReference;

    expect(getTypeArguments(type, stubChecker({}))).toHaveLength(1);
  });

  it('returns nothing when neither the checker nor the type carries arguments', () => {
    const type = {} as ts.TypeReference;

    expect(getTypeArguments(type, stubChecker({}))).toEqual([]);
  });
});

describe('getSelectorProps', () => {
  it('reads no props off a value that cannot be called', () => {
    const checker = stubChecker({ getSignaturesOfType: () => [] });

    expect(getSelectorProps(stubType(), checker)).toEqual([]);
  });

  it('reads no props off a selector that only takes state', () => {
    const checker = stubChecker({
      getSignaturesOfType: () => [{ getParameters: () => [stubSymbol({ name: 'state' })] }],
    });

    expect(getSelectorProps(stubType(), checker)).toEqual([]);
  });

  it('unwraps a tuple props parameter even when it is not declared as a rest', () => {
    const props = [stubSymbol({ name: 'prop1' })];
    const checker = stubChecker({
      getSignaturesOfType: () => [
        {
          getParameters: () => [
            stubSymbol({ name: 'state' }),
            stubSymbol({
              name: 'params',
              valueDeclaration: {},
              getDeclarations: () => undefined,
            }),
          ],
        },
      ],
      getTypeOfSymbolAtLocation: () => stubType(),
      getTypeArguments: () => [stubType()],
      isTupleType: () => true,
      getPropertiesOfType: () => props,
    });

    expect(getSelectorProps(stubType(), checker)).toBe(props);
  });

  it('reads no props off an empty tuple props parameter', () => {
    const checker = stubChecker({
      getSignaturesOfType: () => [
        {
          getParameters: () => [
            stubSymbol({ name: 'state' }),
            stubSymbol({
              name: 'params',
              valueDeclaration: {},
              getDeclarations: () => undefined,
            }),
          ],
        },
      ],
      getTypeOfSymbolAtLocation: () => stubType(),
      getTypeArguments: () => [],
      isTupleType: () => true,
      getPropertiesOfType: () => [stubSymbol({ name: 'length' })],
    });

    expect(getSelectorProps(stubType(), checker)).toEqual([]);
  });

  it('reads no props off a props parameter without a declaration', () => {
    const checker = stubChecker({
      getSignaturesOfType: () => [
        {
          getParameters: () => [
            stubSymbol({ name: 'state' }),
            stubSymbol({ name: 'props', valueDeclaration: undefined }),
          ],
        },
      ],
    });

    expect(getSelectorProps(stubType(), checker)).toEqual([]);
  });
});

describe('getCachedSelectorProps', () => {
  it('falls back to the built selector when the creator carries no type parameters', () => {
    const props = [stubSymbol({ name: 'prop1' })];
    const checker = stubChecker({
      getTypeAtLocation: () => stubType(),
      getSignaturesOfType: (_: ts.Type, kind: ts.SignatureKind) => {
        // The creator call reports no type parameters, so the util has
        // to fall through to reading the built selector instead.
        if (kind === ts.SignatureKind.Call) {
          return [
            {
              getTypeParameters: () => undefined,
              getParameters: () => [
                stubSymbol({ name: 'state' }),
                stubSymbol({
                  name: 'props',
                  valueDeclaration: {},
                  getDeclarations: () => undefined,
                }),
              ],
            },
          ];
        }

        return [];
      },
      getTypeOfSymbolAtLocation: () => stubType(),
      getTypeArguments: () => [],
      isTupleType: () => false,
      getPropertiesOfType: () => props,
    });

    const callExpression = { expression: {} } as ts.CallExpression;

    expect(getCachedSelectorProps(callExpression, checker)).toBe(props);
  });

  it('reads no props when the creator has no call signature at all', () => {
    const checker = stubChecker({
      getTypeAtLocation: () => stubType(),
      getSignaturesOfType: () => [],
    });

    const callExpression = { expression: {} } as ts.CallExpression;

    expect(getCachedSelectorProps(callExpression, checker)).toEqual([]);
  });
});

describe('getImportDeclaration', () => {
  it('finds nothing when the node is not attached to a program', () => {
    const node = { type: 'Identifier' } as TSESTree.Node;

    expect(getImportDeclaration(node, 'reselect-kit')).toBeUndefined();
  });
});

describe('getParametersFromProps', () => {
  it('marks a prop whose type cannot be resolved as unknown', () => {
    const prop = stubSymbol({
      name: 'prop1',
      getDeclarations: () => undefined,
    });

    expect(getParametersFromProps([prop], stubChecker({}))).toEqual([
      {
        name: 'prop1',
        type: undefined,
        typeString: unknownPropType,
        isOptional: false,
      },
    ]);
  });
});

describe('areParametersDifferent', () => {
  const parameter = (overrides: Partial<ParameterInfo>): ParameterInfo => ({
    name: 'prop1',
    type: undefined,
    typeString: unknownPropType,
    isOptional: false,
    ...overrides,
  });

  it('falls back to the printed type when neither prop resolved to one', () => {
    const checker = stubChecker({});

    expect(areParametersDifferent([parameter({})], [parameter({})], checker)).toBe(false);
  });

  it('keeps props apart when only one of them resolved to a type', () => {
    const checker = stubChecker({ isTypeAssignableTo: () => true });

    expect(
      areParametersDifferent(
        [parameter({ type: stubType(), typeString: 'number' })],
        [parameter({})],
        checker,
      ),
    ).toBe(true);
  });
});

describe('isPropOptional', () => {
  it('treats a prop carrying no flags as required', () => {
    const prop = stubSymbol({});

    expect(isPropOptional(prop)).toBe(false);
  });

  it('reads optionality off the symbol flags', () => {
    const prop = stubSymbol({ flags: ts.SymbolFlags.Optional });

    expect(isPropOptional(prop)).toBe(true);
  });
});

describe('isCachedSelectorCreator', () => {
  const callOf = (callee: object) =>
    ({
      expression: {
        kind: ts.SyntaxKind.CallExpression,
        expression: callee,
      },
    }) as unknown as ts.CallExpression;

  it('treats a callee without declarations as unrelated', () => {
    const callee = { kind: ts.SyntaxKind.Identifier };
    const checker = stubChecker({
      getSymbolAtLocation: () =>
        stubSymbol({
          flags: 0,
          getName: () => 'somethingElse',
          getDeclarations: () => undefined,
        }),
    });

    expect(isCachedSelectorCreator(callOf(callee), checker)).toBe(false);
  });

  it('keeps the binding`s own name when its source cannot be resolved', () => {
    const initializer = { kind: ts.SyntaxKind.Identifier } as ts.Identifier;
    const callee = { kind: ts.SyntaxKind.Identifier };
    const symbol = stubSymbol({
      flags: 0,
      getName: () => 'createCachedSelector',
      getDeclarations: () => [
        {
          kind: ts.SyntaxKind.VariableDeclaration,
          initializer,
        },
      ],
    });
    const checker = stubChecker({
      getSymbolAtLocation: (node: ts.Node) => (node === initializer ? undefined : symbol),
    });

    expect(isCachedSelectorCreator(callOf(callee), checker)).toBe(true);
  });

  it('stops when renamed bindings refer back to each other', () => {
    const identifier = { kind: ts.SyntaxKind.Identifier } as ts.Identifier;
    const looping = stubSymbol({
      flags: 0,
      getName: () => 'looping',
      getDeclarations: () => [
        {
          kind: ts.SyntaxKind.VariableDeclaration,
          initializer: identifier,
        },
      ],
    });
    const checker = stubChecker({ getSymbolAtLocation: () => looping });
    const callExpression = {
      expression: {
        kind: ts.SyntaxKind.CallExpression,
        expression: identifier,
      },
    } as unknown as ts.CallExpression;

    expect(isCachedSelectorCreator(callExpression, checker)).toBe(false);
  });
});

describe('getKeySelector', () => {
  it('finds nothing among options that do not include one', () => {
    expect(getKeySelector([stubSymbol({ name: 'cacheObject' })])).toBeUndefined();
  });
});
