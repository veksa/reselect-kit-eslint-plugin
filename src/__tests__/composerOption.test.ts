import {stripIndent} from 'common-tags';
import {createRuleTester} from '../utils/ruleTester';
import {defaultComposer, Errors, noDifferentPropsRule} from '../rules/noDifferentProps';

const ruleTester = createRuleTester();

// The composer only shows up once a selector needs more than one prop, since a
// single prop needs nothing to compose it with.
ruleTester.run(
    'no-different-props-composer-option',
    noDifferentPropsRule,
    {
        valid: [],
        invalid: [
            {
                options: [{composer: 'arrayComposeKeySelectors'}],
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: string }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
`,
                output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, arrayComposeKeySelectors} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: string }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: arrayComposeKeySelectors(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2()
    ),
});
`,
                errors: [
                    {
                        messageId: Errors.DifferentProps,
                    },
                ],
            },
            // No option given: the default composer is used.
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: string }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: createPropSelector<{ prop1: number }>().prop1(),
});
`,
                output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, ${defaultComposer}} from 'reselect-kit';

createCachedSelector(
    [
        (state: unknown, props: { prop1: number }) => props.prop1,
        (state: unknown, props: { prop2: string }) => props.prop2,
    ],
    () => 1,
)({
    keySelector: ${defaultComposer}(
        createPropSelector<{ prop1: number }>().prop1(),
        createPropSelector<{ prop2: string }>().prop2()
    ),
});
`,
                errors: [
                    {
                        messageId: Errors.DifferentProps,
                    },
                ],
            },
        ],
    },
);
