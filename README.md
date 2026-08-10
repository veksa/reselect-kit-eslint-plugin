# eslint-plugin-reselect-kit

ESLint rules that keep cached selectors and their key selectors in sync when using
[reselect-kit](https://github.com/veksa/reselect-kit) and
[@veksa/re-reselect](https://github.com/veksa/re-reselect).

A cached selector memoizes per key, so a key selector that reads different props than
the selector itself produces cache entries that never hit - or collide. Both rules are
type driven and both can fix what they find.

## Installation

```bash
# npm
npm install eslint-plugin-reselect-kit --save-dev

# yarn
yarn add eslint-plugin-reselect-kit --dev
```

### Requirements

| | |
|---|---|
| ESLint | 9 or later, flat config only |
| `@typescript-eslint/parser` | 8.44 or later, configured with type information |
| TypeScript | 5.9 or later |

Verified against ESLint 10.8 and `@typescript-eslint` 8.66.

## Setup

Both rules read the types of your selectors, so the parser has to be pointed at a
`tsconfig.json`. Without type information they report nothing.

```js
// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import {reselectKitPlugin} from 'eslint-plugin-reselect-kit';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    ...reselectKitPlugin.configs.all,
];
```

`configs.all` registers the plugin under the `reselect-kit` namespace and turns both
rules on as errors. To change a severity or pass options, add a block after it:

```js
export default [
    ...reselectKitPlugin.configs.all,
    {
        rules: {
            'reselect-kit/require-key-selector': 'warn',
            'reselect-kit/no-different-props': ['error', {composer: 'arrayComposeKeySelectors'}],
        },
    },
];
```

## What the rules look at

Every call of the shape `creator(...)(options)` is checked, where `creator` is one of
`createCachedSelector`, `createCachedStructuredSelector` or
`createCachedSequenceSelector`.

The creator is resolved through its import, so a barrel module that renames it on the
way out is still checked:

```ts
// utils/redux.ts
export {createCachedStructuredSelector as cachedStruct} from 'reselect-kit';

// anywhere.ts - checked, even though the call says `cachedStruct`
cachedStruct({...})({keySelector: ...});
```

Options handed over as an expression (`creator(...)(getOptions())`) are still reported,
but cannot be fixed automatically - there is no object literal to rewrite.

## Rules

### `reselect-kit/no-different-props`

Reports a cached selector whose key selector does not read exactly the props the
selector itself declares - a different name, a different type, or a different
optionality all count.

```ts
import {createCachedSelector} from '@veksa/re-reselect';
import {createPropSelector} from 'reselect-kit';

// error: selector parameters = { itemId: number }, key selector parameters = { id: number }
createCachedSelector(
    [
        (state: State, props: {itemId: number}) => state.items[props.itemId],
    ],
    item => item,
)({
    keySelector: createPropSelector<{id: number}>().id(),
});
```

The fix rewrites `keySelector` to match the selector and adds the imports it needs:

```ts
createCachedSelector(
    [
        (state: State, props: {itemId: number}) => state.items[props.itemId],
    ],
    item => item,
)({
    keySelector: createPropSelector<{ itemId: number }>().itemId(),
});
```

A selector that takes no props at all is fixed to `defaultKeySelector`. When it takes
more than one, the props are composed:

```ts
keySelector: stringComposeKeySelectors(
    createPropSelector<{ accountId: number }>().accountId(),
    createPropSelector<{ symbolId: number }>().symbolId()
),
```

Hand written key selectors are compared the same way, so
`(state: State, props: {itemId: number}) => props.itemId` is accepted where the props
line up.

#### Options

| Option | Default | Description |
|---|---|---|
| `composer` | `'stringComposeKeySelectors'` | Helper the fix wraps multiple prop selectors in. Set it to `'arrayComposeKeySelectors'`, or to your own composer, and the fix imports that name instead. |

```js
'reselect-kit/no-different-props': ['error', {composer: 'arrayComposeKeySelectors'}]
```

### `reselect-kit/require-key-selector`

Reports a cached selector created without a `keySelector`, which leaves it memoizing
under a single shared key.

```ts
// error: Cached selector can`t work without key selector
createCachedSelector(
    [
        (state: State) => state.items,
    ],
    items => items,
)({});
```

The fix inserts `defaultKeySelector` and imports it:

```ts
import {defaultKeySelector} from 'reselect-kit';

createCachedSelector(
    [
        (state: State) => state.items,
    ],
    items => items,
)({
    keySelector: defaultKeySelector
});
```

A `keySelector` arriving through a spread (`{...createDefaultOptions()}`) satisfies the
rule.

## Development

```bash
yarn compile        # type check
yarn test           # run the rule tests
yarn test:coverage  # the suite is kept at 100%
yarn build          # emit lib/
```

## Contributing

This project welcomes contributions and suggestions.

## License

[MIT](LICENSE.md)
