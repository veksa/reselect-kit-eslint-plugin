import {stripIndent} from 'common-tags';
import {createRuleTester} from '../utils/ruleTester';
import {Errors, requireKeySelectorRule} from '../rules/requireKeySelector';

const ruleTester = createRuleTester();

ruleTester.run(
    'require-key-create-cached-selector',
    requireKeySelectorRule,
    {
        valid: [
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: () => 1,
});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
});
`,
            },
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
() => 1,
)({
    ...getDefaultOptions(),
    keySelector: () => 1,
});
`,
            },
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    keySelector: () => 1,
    ...getDefaultOptions(),
});
`,
            },
        ],
        invalid: [
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
});
`,
                output: stripIndent`
import {defaultKeySelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [],
    () => 1,
)({});
`,
                output: stripIndent`
import {defaultKeySelector} from 'reselect-kit';
import {createCachedSelector} from '@veksa/re-reselect';

createCachedSelector(
    [],
    () => 1,
)({
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
});
`,
                output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector, defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
});
`,
                output: stripIndent`
import {createCachedSelector} from '@veksa/re-reselect';
import {defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSelector(
    [],
    () => 1,
)({
    ...getDefaultOptions(),
    keySelector: defaultKeySelector
});
`,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
        ],
    },
);

ruleTester.run(
    'require-key-cached-struct-selector',
    requireKeySelectorRule,
    {
        valid: [
            {
                code: stripIndent`
import {createCachedStructuredSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: () => 1,
});

createCachedStructuredSelector({})({
    ...getDefaultOptions(),
});
      `,
            },
            {
                code: stripIndent`
import {createCachedStructuredSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedStructuredSelector({})({
    ...getDefaultOptions(),
    keySelector: () => 1,
});
      `,
            },
            {
                code: stripIndent`
import {createCachedStructuredSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedStructuredSelector({})({
    keySelector: () => 1,
    ...getDefaultOptions(),
});
      `,
            },
        ],
        invalid: [
            {
                code: stripIndent`
import {createCachedStructuredSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedStructuredSelector({})({
    ...getDefaultOptions(),
});
      `,
                output: stripIndent`
import {createCachedStructuredSelector, defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedStructuredSelector({})({
    ...getDefaultOptions(),
    keySelector: defaultKeySelector
});
      `,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {createCachedStructuredSelector} from 'reselect-kit';

createCachedStructuredSelector({})({
});
      `,
                output: stripIndent`
import {createCachedStructuredSelector, defaultKeySelector} from 'reselect-kit';

createCachedStructuredSelector({})({
    keySelector: defaultKeySelector
});
      `,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
        ],
    },
);

ruleTester.run(
    'require-key-cached-seq-selector',
    requireKeySelectorRule,
    {
        valid: [
            {
                code: stripIndent`
import {createCachedSequenceSelector} from 'reselect-kit';

const getDefaultOptions = () => ({
    keySelector: () => 1,
});

createCachedSequenceSelector([])({
    ...getDefaultOptions(),
});
      `,
            },
            {
                code: stripIndent`
import {createCachedSequenceSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSequenceSelector([])({
    ...getDefaultOptions(),
    keySelector: () => 1,
});
      `,
            },
            {
                code: stripIndent`
import {createCachedSequenceSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSequenceSelector([])({
    keySelector: () => 1,
    ...getDefaultOptions(),
});
      `,
            },
        ],
        invalid: [
            {
                code: stripIndent`
import {createCachedSequenceSelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSequenceSelector([])({
    ...getDefaultOptions(),
});
      `,
                output: stripIndent`
import {createCachedSequenceSelector, defaultKeySelector} from 'reselect-kit';

const getDefaultOptions = () => ({});

createCachedSequenceSelector([])({
    ...getDefaultOptions(),
    keySelector: defaultKeySelector
});
      `,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
            {
                code: stripIndent`
import {createCachedSequenceSelector} from 'reselect-kit';

createCachedSequenceSelector([])({});
`,
                output: stripIndent`
import {createCachedSequenceSelector, defaultKeySelector} from 'reselect-kit';

createCachedSequenceSelector([])({
    keySelector: defaultKeySelector
});
      `,
                errors: [
                    {
                        messageId: Errors.KeySelectorIsMissing,
                    },
                ],
            },
        ],
    },
);
