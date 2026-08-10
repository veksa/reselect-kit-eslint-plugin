import { stripIndent } from 'common-tags';
import { createRuleTester } from './ruleTester';
import { Errors, noDifferentPropsRule } from '../rules/noDifferentProps';

const ruleTester = createRuleTester();

// Props are the same when the checker says the types are mutually assignable,
// not when they happen to be spelled - or printed - the same way.
ruleTester.run('no-different-props-type-identity', noDifferentPropsRule, {
  valid: [
    // A type alias is printed by its name, so comparing printed types would
    // read `Status` as different from the union it stands for.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

type Status = 'active' | 'closed';

createCachedSelector(
    [
        (state: unknown, props: { status: Status }) => props.status,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { status: 'active' | 'closed' }) => props.status,
});
`,
    },
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

type Meta = {code: number};

createCachedSelector(
    [
        (state: unknown, props: { meta: Meta }) => props.meta,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { meta: { code: number } }) => props.meta.code,
});
`,
    },
    // An intersection is printed in the order it was written.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

interface M1 {
    m1: number;
}

interface M2 {
    m2: number;
}

createCachedSelector(
    [
        (state: unknown, props: { meta: M1 & M2 }) => props.meta,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { meta: M2 & M1 }) => props.meta.m1,
});
`,
    },
    // The declaration of an instantiated generic prop still reads `value: T`.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

interface Props<T> {
    value: T;
}

createCachedSelector(
    [
        (state: unknown, props: Props<number>) => props.value,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { value: number }) => props.value,
});
`,
    },
    // A prop made optional by a mapped type has no question token to read.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

interface ItemProps {
    itemId: number;
}

createCachedSelector(
    [
        (state: unknown, props: Partial<ItemProps>) => props.itemId,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { itemId?: number }) => props.itemId,
});
`,
    },
  ],
  invalid: [
    // `any` is assignable in both directions, so it has to be kept apart from
    // everything else explicitly - it is exactly the key selector worth
    // catching.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { prop1: any }) => props.prop1,
});
`,
      output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

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
    // The fix has to name the instantiated type: a `T` read off the
    // declaration is not in scope where the fix lands.
    {
      code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

interface Props<T> {
    value: T;
}

createCachedSelector(
    [
        (state: unknown, props: Props<number>) => props.value,
    ],
    () => 1,
)({
    keySelector: (state: unknown, props: { other: string }) => props.other,
});
`,
      output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

interface Props<T> {
    value: T;
}

createCachedSelector(
    [
        (state: unknown, props: Props<number>) => props.value,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ value: number }>().value(),
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
