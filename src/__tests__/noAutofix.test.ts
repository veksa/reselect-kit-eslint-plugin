import {stripIndent} from 'common-tags';
import {createRuleTester} from '../utils/ruleTester';
import {Errors as DifferentPropsErrors, noDifferentPropsRule} from '../rules/noDifferentProps';
import {Errors as KeySelectorErrors, requireKeySelectorRule} from '../rules/requireKeySelector';

const ruleTester = createRuleTester();

// Both rules rewrite the options object in place, so when the options are
// handed over as an expression there is nothing to rewrite. The problem is
// still worth reporting - it just cannot be fixed automatically.
ruleTester.run(
    'no-different-props-without-autofix',
    noDifferentPropsRule,
    {
        invalid: [
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getOptions = () => ({
    keySelector: createPropSelector<{ prop2: string }>().prop2(),
});

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)(getOptions());
`,
                output: null,
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
    'require-key-selector-without-autofix',
    requireKeySelectorRule,
    {
        invalid: [
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

const getOptions = () => ({});

createCachedSelector(
    [
        () => 1,
    ],
    () => 1,
)(getOptions());
`,
                output: null,
                errors: [
                    {
                        messageId: KeySelectorErrors.KeySelectorIsMissing,
                    },
                ],
            },
        ],
    },
);

// Calls that only look like a cached selector creator must be left alone.
ruleTester.run(
    'no-different-props-unrelated-calls',
    noDifferentPropsRule,
    {
        valid: [
            `const createCachedSelector = (input: unknown) => (options: unknown) => 1;
createCachedSelector([])({keySelector: 1});`,
            `const value = [1, 2, 3].map(item => item + 1);`,
            `function createSomething() { return () => 1; }
createSomething()();`,
            // The callee has no symbol to resolve, so the name it was written
            // with is all the rule has to go on.
            `(() => (options: {keySelector: number}) => 1)()({keySelector: 1});`,
        ],
    },
);

// A key selector reached through a union of option objects resolves to a
// synthetic symbol that no single declaration backs, so its props cannot be
// compared and the call has to be left alone.
ruleTester.run(
    'no-different-props-union-options',
    noDifferentPropsRule,
    {
        valid: [
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

declare const flag: boolean;

const options = flag
    ? {keySelector: createPropSelector<{ prop1: number }>().prop1()}
    : {keySelector: createPropSelector<{ prop2: string }>().prop2()};

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
    ],
    () => 1,
)(options);
`,
            },
        ],
    },
);
