import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { ConfigurableModuleGeneratorSchema } from './schema';

export default async function configurableModuleGenerator(
  tree: Tree,
  options: ConfigurableModuleGeneratorSchema,
) {
  const project = readProjectConfiguration(tree, options.project);
  const { className, fileName } = names(options.name);

  const moduleDirectory = joinPathFragments(
    project.sourceRoot ?? joinPathFragments(project.root, 'src'),
    'app',
    options.directory ?? '',
    fileName,
  );

  generateFiles(tree, path.join(__dirname, 'files'), moduleDirectory, {
    className,
    name: fileName,
    tmpl: '',
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
