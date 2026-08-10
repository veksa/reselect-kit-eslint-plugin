import { resolve } from 'path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';

export const createRuleTester = () => {
  const tsconfigRootDir = resolve(__dirname, '../../');
  const project = resolve(tsconfigRootDir, 'tsconfig.eslint.json');
  const filename = 'file.ts';

  const tester = new RuleTester({
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        project,
        sourceType: 'module',
        tsconfigRootDir,
      },
    },
  });

  const run = tester.run.bind(tester);
  tester.run = (name, rule, tests) => {
    const { invalid = [], valid = [] } = tests;

    run(name, rule, {
      invalid: invalid.map((test) => {
        return { ...test, filename };
      }),
      valid: valid.map((test) => {
        return typeof test === 'string' ? { code: test, filename } : { ...test, filename };
      }),
    });
  };

  return tester;
};
