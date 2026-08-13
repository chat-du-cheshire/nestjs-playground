import { Tree, addProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './generator';
import { ConfigurableModuleGeneratorSchema } from './schema';

describe('configurable-module generator', () => {
  let tree: Tree;
  const options: ConfigurableModuleGeneratorSchema = {
    name: 'payments',
    project: 'advanced-concepts',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'advanced-concepts', {
      root: 'apps/advanced-concepts',
      sourceRoot: 'apps/advanced-concepts/src',
      projectType: 'application',
    });
  });

  it('generates the module and module-definition files', async () => {
    await generator(tree, options);

    expect(
      tree.exists(
        'apps/advanced-concepts/src/app/payments/payments.module.ts',
      ),
    ).toBeTruthy();
    expect(
      tree.exists(
        'apps/advanced-concepts/src/app/payments/payments.module-definition.ts',
      ),
    ).toBeTruthy();

    const moduleContent = tree.read(
      'apps/advanced-concepts/src/app/payments/payments.module.ts',
      'utf-8',
    );
    expect(moduleContent).toContain(
      'export class PaymentsModule extends ConfigurableModuleClass',
    );
  });
});
