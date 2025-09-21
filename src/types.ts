export type Trigger = 'release_published' | 'release_created' | 'tag';

export interface CLIOptions {
  output: string;
  split: boolean;
  'no-scripts': boolean;
  trigger: Trigger;
  env: string | undefined;
  prerelease: boolean;
  interactive: boolean;
  changesets: boolean;
}
