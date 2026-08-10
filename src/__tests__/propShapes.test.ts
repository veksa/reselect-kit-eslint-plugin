import { stripIndent } from 'common-tags';
import { createRuleTester } from './ruleTester';
import { Errors, noDifferentPropsRule } from '../rules/noDifferentProps';

const ruleTester = createRuleTester();

// Prop shapes taken from real application code: array props, hand written key
// selectors, literal unions, readonly and index-signature props.
ruleTester.run('no-different-props-prop-shapes', noDifferentPropsRule, {
  valid: [
    // A hand written key selector declares props as a plain parameter
    // rather than the rest tuple the reselect-kit helpers produce.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [
        (state: {}, props: { positionIds: number[] }) => props.positionIds.join(':'),
    ],
    (key: string) => key,
)({
    keySelector: (state: {}, props: { positionIds: number[] }) => props.positionIds.join(':'),
});
`,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { positionIds: number[] }) => props.positionIds,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ positionIds: number[] }>().positionIds(),
});
`,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { mode: 'buy' | 'sell' }) => props.mode,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ mode: 'buy' | 'sell' }>().mode(),
});
`,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { symbolId: number | undefined }) => props.symbolId,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ symbolId: number | undefined }>().symbolId(),
});
`,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { ids: readonly number[] }) => props.ids,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ ids: readonly number[] }>().ids(),
});
`,
    },
  ],
  invalid: [
    // Input selectors passed variadically rather than as an array.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    (state: unknown, props: { prop1: number }) => props.prop1,
    (prop1: number) => prop1,
)({
    keySelector: createPropSelector<{ prop2: string }>().prop2(),
});
`,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    (state: unknown, props: { prop1: number }) => props.prop1,
    (prop1: number) => prop1,
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
    // A selector taking several parametric arguments rather than one
    // props object: only the first is a props bag the helpers can build
    // a key selector from.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, first: { prop1: number }, second: { prop2: string }) => first.prop1,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop9: boolean }>().prop9(),
});
`,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, first: { prop1: number }, second: { prop2: string }) => first.prop1,
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
    // An array prop has to survive the round trip through the fix text.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { positionIds: number[] }) => props.positionIds,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ positionId: number }>().positionId(),
});
`,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { positionIds: number[] }) => props.positionIds,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ positionIds: number[] }>().positionIds(),
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
        (state: unknown, props: { mode: 'buy' | 'sell' }) => props.mode,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ mode: string }>().mode(),
});
`,
      output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { mode: 'buy' | 'sell' }) => props.mode,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ mode: "buy" | "sell" }>().mode(),
});
`,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    // A hand written key selector that reads the wrong prop.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [
        (state: {}, props: { positionIds: number[] }) => props.positionIds.join(':'),
    ],
    (key: string) => key,
)({
    keySelector: (state: {}, props: { accountId: number }) => props.accountId,
});
`,
      output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [
        (state: {}, props: { positionIds: number[] }) => props.positionIds.join(':'),
    ],
    (key: string) => key,
)({
    keySelector: createPropSelector<{ positionIds: number[] }>().positionIds(),
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
