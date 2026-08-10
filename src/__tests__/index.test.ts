import { reselectKitPlugin } from '../index';
import { noDifferentPropsRule } from '../rules/noDifferentProps';
import { requireKeySelectorRule } from '../rules/requireKeySelector';

describe('reselectKitPlugin', () => {
  const [config] = reselectKitPlugin.configs.all;

  it('ships a single flat config named after the plugin', () => {
    expect(reselectKitPlugin.configs.all).toHaveLength(1);
    expect(config.name).toBe('reselect-kit');
  });

  it('registers the plugin under the `reselect-kit` namespace', () => {
    const plugin = config.plugins?.['reselect-kit'];

    expect(plugin?.meta?.name).toBe('reselect-kit');
    expect(plugin?.rules).toEqual({
      'no-different-props': noDifferentPropsRule,
      'require-key-selector': requireKeySelectorRule,
    });
  });

  it('turns every rule it ships on as an error', () => {
    const plugin = config.plugins?.['reselect-kit'];
    const ruleNames = Object.keys(plugin?.rules ?? {});

    expect(config.rules).toEqual({
      'reselect-kit/no-different-props': 'error',
      'reselect-kit/require-key-selector': 'error',
    });
    expect(Object.keys(config.rules ?? {})).toEqual(
      ruleNames.map((name) => `reselect-kit/${name}`),
    );
  });

  it('describes both rules', () => {
    expect(noDifferentPropsRule.meta.docs?.description).toBeTruthy();
    expect(requireKeySelectorRule.meta.docs?.description).toBeTruthy();
    expect(noDifferentPropsRule.meta.fixable).toBe('code');
    expect(requireKeySelectorRule.meta.fixable).toBe('code');
  });
});
