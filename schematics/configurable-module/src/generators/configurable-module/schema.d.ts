export interface ConfigurableModuleGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  skipFormat?: boolean;
}
