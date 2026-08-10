import { noDifferentPropsRule } from './rules/noDifferentProps';
import { requireKeySelectorRule } from './rules/requireKeySelector';
import type { TSESLint } from '@typescript-eslint/utils';

const meta = {
  name: 'reselect-kit',
};

const rules = {
  'no-different-props': noDifferentPropsRule,
  'require-key-selector': requireKeySelectorRule,
};

const plugin = { meta, rules };

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
  },
];

export const reselectKitPlugin = {
  configs: { all },
};

/**
 * The eslintrc engine loads a plugin by name and looks the rules up on the
 * module itself, so `plugins: ['reselect-kit']` needs them re-exported here.
 *
 * `configs` is deliberately not exposed this way: `all` is a flat config array
 * and `extends: 'plugin:reselect-kit/all'` would fail on it. Under eslintrc
 * list the two rules directly.
 */
export { meta, rules };
