import { stripIndent } from 'common-tags';
import { createRuleTester } from './ruleTester';
import { Errors, noDifferentPropsRule } from '../rules/noDifferentProps';

const ruleTester = createRuleTester();

ruleTester.run('no-different-props-create-cached-selector', noDifferentPropsRule, {
  valid: [
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

interface StateA {
    stateA: {stateAField: number};
}

const selectorA = createCachedSelector(
    [
        (state: StateA) => state.stateA,
        createPropSelector<{ prop1: number }>().prop1(),
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
    ),
});

interface StateB {
    stateB: {stateBField: number}
}

const selectorB = createCachedSelector(
    [
        (state: StateB) => state.stateB,
        createPropSelector<{ prop1: number }>().prop1(),
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});

createCachedSelector(
    [
        selectorA,
        selectorB,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

interface StateA {
    stateA: {stateAField: number};
}

enum EnumType {
    Field = 'field'
}

const selectorA = createCachedSelector(
    [
        (state: StateA) => state.stateA,
        createPropSelector<{ prop1: EnumType }>().prop1(),
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: EnumType }>().prop1(),
    ),
});

interface StateB {
    stateB: {stateBField: number};
}
const selectorB = createCachedSelector(
    [
        (state: StateB) => state.stateB,
        createPropSelector<{ prop1: EnumType }>().prop1(),
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: EnumType }>().prop1(),
});

createCachedSelector(
    [
        selectorA,
        selectorB,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: EnumType }>().prop1()
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    ...getDefaultOptions(),
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

const selectorA = createCachedSelector(
    [
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2(),
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2(),
    ),
});

const selectorB = createCachedSelector(
    [
        createPropSelector<{ prop1: number }>().prop1(),
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});

createCachedSelector(
    [
        selectorA,
        selectorB,
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2()
    ),
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2(),
    ),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: string }) => props.prop2,
    ],
    () => 1,
)({
    ...getDefaultOptions(),
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: defaultKeySelector,
});

createCachedSelector(
    [
        () => 1,
    ],
    () => 1,
)({
    ...getDefaultOptions(),
});
        `,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

interface StateA {
    stateA: {stateAField: number};
}

enum EnumType {
    Field = 'field'
}

const selectorA = createCachedSelector(
    [
        (state: StateA) => state.stateA,
        createPropSelector<{ prop1?: EnumType }>().prop1(),
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1?: EnumType }>().prop1(),
    ),
});

interface StateB {
    stateB: {stateBField: number};
}

const selectorB = createCachedSelector(
    [
        (state: StateB) => state.stateB,
        createPropSelector<{ prop1?: EnumType }>().prop1(),
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1?: EnumType }>().prop1(),
});

createCachedSelector(
    [
        selectorA,
        selectorB,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1?: EnumType }>().prop1(),
});
        `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

enum Field {
}

createCachedSelector(
    [
        (state: unknown, props: { prop1?: Field }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { prop2?: Field }) => props.prop2,
});
        `,
      output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

enum Field {
}

createCachedSelector(
    [
        (state: unknown, props: { prop1?: Field }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1?: Field | undefined }>().prop1(),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

enum Field {
}

createCachedSelector(
    [
        (state: unknown, props: { prop1?: Field }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

enum Field {
}

createCachedSelector(
    [
        (state: unknown, props: { prop1?: Field }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1?: Field | undefined }>().prop1(),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1?: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1?: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1?: number | undefined }>().prop1(),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    ...getDefaultOptions()
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    ...getDefaultOptions()
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: number }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: number }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: number }>().prop2()
    ),
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [],
    () => 1,
)({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});
        `,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, defaultKeySelector} from 'reselect-kit';

createCachedSelector(
    [],
    () => 1,
)({
    keySelector: defaultKeySelector,
});
        `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
  ],
});

ruleTester.run('no-different-props-cached-struct', noDifferentPropsRule, {
  valid: [
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    ...getDefaultOptions(),
});
      `,
    },
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2(),
    ),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
    prop2: (state: unknown, props: { prop2: string }) => props.prop2,
})({
    ...getDefaultOptions(),
});
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});
      `,
      output: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    ...getDefaultOptions()
});
      `,
      output: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    ...getDefaultOptions()
});
      `,
      output: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});
      `,
      output: stripIndent`
import {createCachedStructuredSelector, createPropSelector} from 'reselect-kit';

createCachedStructuredSelector({
    prop1: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
  ],
});

ruleTester.run('no-different-props-cached-seq', noDifferentPropsRule, {
  valid: [
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    ...getDefaultOptions(),
});
      `,
    },
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector, stringComposeKeySelectors} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: stringComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: number }>().prop2(),
    ),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number; prop2: number }) => props.prop1,
    (state: unknown, props: { prop1: number; prop2: number }) => props.prop2,
])({
    ...getDefaultOptions(),
});
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});
      `,
      output: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    ...getDefaultOptions()
});
      `,
      output: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop1: string }>().prop1(),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    ...getDefaultOptions()
});
      `,
      output: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    ...getDefaultOptions(),
    keySelector: createPropSelector<{ prop1: number }>().prop1()
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: createPropSelector<{ prop2: number }>().prop2(),
});
      `,
      output: stripIndent`
import {createCachedSequenceSelector, createPropSelector} from 'reselect-kit';

createCachedSequenceSelector([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
  ],
});
