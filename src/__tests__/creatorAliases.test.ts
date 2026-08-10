import {stripIndent} from 'common-tags';
import {createRuleTester} from '../utils/ruleTester';
import {Errors as DifferentPropsErrors, noDifferentPropsRule} from '../rules/noDifferentProps';
import {Errors as KeySelectorErrors, requireKeySelectorRule} from '../rules/requireKeySelector';

const ruleTester = createRuleTester();

// Applications commonly funnel the creators through a barrel module and rename
// them there, so the rules have to resolve the callee back to its declaration
// instead of matching the identifier as written. `./aliases` re-exports
// createCachedSelector as `cached`, createCachedSequenceSelector as `cachedSeq`
// and createCachedStructuredSelector as `cachedStruct`.
ruleTester.run(
    'no-different-props-aliased-creators',
    noDifferentPropsRule,
    {
        valid: [
            {
                code: stripIndent`
import {cached, prop} from './aliases';

cached(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: prop<{ prop1: number }>().prop1(),
});
`,
            },
            {
                code: stripIndent`
import {cachedStruct, prop} from './aliases';

cachedStruct({
    a: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: prop<{ prop1: number }>().prop1(),
});
`,
            },
            {
                code: stripIndent`
import {cachedSeq, prop} from './aliases';

cachedSeq([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: prop<{ prop1: number }>().prop1(),
});
`,
            },
        ],
        invalid: [
            {
                code: stripIndent`
import {cached, prop} from './aliases';

cached(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: prop<{ prop2: string }>().prop2(),
});
`,
                output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {cached, prop} from './aliases';

cached(
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
                        messageId: DifferentPropsErrors.DifferentProps,
                    },
                ],
            },
            {
                code: stripIndent`
import {cachedStruct, prop} from './aliases';

cachedStruct({
    a: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: prop<{ prop2: string }>().prop2(),
});
`,
                output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {cachedStruct, prop} from './aliases';

cachedStruct({
    a: (state: unknown, props: { prop1: number }) => props.prop1,
})({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
`,
                errors: [
                    {
                        messageId: DifferentPropsErrors.DifferentProps,
                    },
                ],
            },
            {
                code: stripIndent`
import {cachedSeq, prop} from './aliases';

cachedSeq([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: prop<{ prop2: string }>().prop2(),
});
`,
                output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {cachedSeq, prop} from './aliases';

cachedSeq([
    (state: unknown, props: { prop1: number }) => props.prop1,
])({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
`,
                errors: [
                    {
                        messageId: DifferentPropsErrors.DifferentProps,
                    },
                ],
            },
            // Renamed by assignment instead of by an import alias.
            {
                code: stripIndent`
import {cachedConst, prop} from './aliases';

cachedConst(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)({
    keySelector: prop<{ prop2: string }>().prop2(),
});
`,
                output: stripIndent`
import {createPropSelector} from 'reselect-kit';
import {cachedConst, prop} from './aliases';

cachedConst(
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
                        messageId: DifferentPropsErrors.DifferentProps,
                    },
                ],
            },
        ],
    },
);

ruleTester.run(
    'require-key-selector-aliased-creators',
    requireKeySelectorRule,
    {
        valid: [
            {
                code: stripIndent`
import {cachedStruct, defaultKeySelector} from './aliases';

cachedStruct({
    a: () => 1,
})({
    keySelector: defaultKeySelector,
});
`,
            },
            {
                code: stripIndent`
import {cachedConst, defaultKeySelector} from './aliases';

cachedConst(
    [
        () => 1,
    ],
    () => 1,
)({
    keySelector: defaultKeySelector,
});
`,
            },
        ],
        invalid: [
            {
                code: stripIndent`
import {cached} from './aliases';

cached(
    [
        () => 1,
    ],
    () => 1,
)({});
`,
                output: stripIndent`
import {defaultKeySelector} from 'reselect-kit';
import {cached} from './aliases';

cached(
    [
        () => 1,
    ],
    () => 1,
)({
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: KeySelectorErrors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {cachedSeq} from './aliases';

cachedSeq([
    () => 1,
])({});
`,
                output: stripIndent`
import {defaultKeySelector} from 'reselect-kit';
import {cachedSeq} from './aliases';

cachedSeq([
    () => 1,
])({
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: KeySelectorErrors.KeySelectorIsMissing,
                    },
                ],
            },
        ],
    },
);
