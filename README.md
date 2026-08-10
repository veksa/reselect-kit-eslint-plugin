# eslint-plugin-reselect-kit

ESLint plugin to enforce best practices when using reselect and reselect-kit libraries

## Installation

eslint-plugin-reselect-kit requires TypeScript 5.8 or later.

### Using npm or yarn

```bash
# npm
npm install eslint-plugin-reselect-kit --save-dev

# yarn
yarn add eslint-plugin-reselect-kit --dev
```

## Features

- Static analysis for reselect and reselect-kit selectors
- Enforces consistent selector patterns
- Automatic fixing capabilities for common issues
- TypeScript support

## Configuration

The plugin ships a flat config. Add it to your `eslint.config.js`:

```js
import tsParser from '@typescript-eslint/parser';
import {reselectKitPlugin} from 'eslint-plugin-reselect-kit';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  ...reselectKitPlugin.configs.all,
];
```

Both rules rely on type information, so `@typescript-eslint/parser` must be configured with a `project`.

To tune severity, override the rules after spreading the config:

```js
export default [
  ...reselectKitPlugin.configs.all,
  {
    rules: {
      'reselect-kit/no-different-props': 'error',
      'reselect-kit/require-key-selector': 'warn',
    },
  },
];
```

## Rules

### no-different-props

Ensures that cached selectors and key selectors use the same props.

**Rule details:**
- Checks that cached selectors and their key selectors access the same properties
- Can automatically fix issues by generating correct key selectors

**Options:**
```js
{
  "composer": "stringComposeKeySelectors" // Default
}
```

### require-key-selector

Ensures that cached selectors always have a key selector specified.

**Rule details:**
- Requires key selectors for proper memoization when using createCachedSelector
- Can automatically add default key selectors

## Basic Usage

```js
import { createCachedSelector } from '@veksa/re-reselect';
import { createPropSelector } from 'reselect-kit';

// Good - props match in selector and key selector
const goodSelector = createCachedSelector(
  state => state.items,
  (state, props) => props.id,
  (items, id) => items[id]
)({
  keySelector: createPropSelector('id')
});

// Bad - props don't match between selector and key selector
const badSelector = createCachedSelector(
  state => state.items,
  (state, props) => props.id,
  (items, id) => items[id]
)({
  keySelector: createPropSelector('differentId') // ESLint will flag this
});
```

## Contributing

This project welcomes contributions and suggestions.

## License

[MIT](LICENSE.md)
