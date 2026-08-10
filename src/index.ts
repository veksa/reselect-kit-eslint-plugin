import {noDifferentPropsRule} from './rules/noDifferentProps';
import {requireKeySelectorRule} from './rules/requireKeySelector';
import type {TSESLint} from '@typescript-eslint/utils';

const plugin = {
    meta: {
        name: 'reselect-kit',
    },
    rules: {
        'no-different-props': noDifferentPropsRule,
        'require-key-selector': requireKeySelectorRule,
    },
};

const all: TSESLint.FlatConfig.ConfigArray = [
    {
        name: 'reselect-kit',
        plugins: {
            'reselect-kit': plugin,
        },
        rules: {
            'reselect-kit/no-different-props': 'error',
            'reselect-kit/require-key-selector': 'error',
        },
    }
];

export const reselectKitPlugin = {
    configs: {all},
};
