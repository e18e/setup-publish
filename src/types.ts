export type Trigger =
  | 'release_published'
  | 'release_created'
  | 'tag'
  | 'push_main';
export type ChangeLogTool = 'changelogithub' | 'changesets' | 'none';

export interface CLIOptions {
  output: string;
  split: boolean;
  'no-scripts': boolean;
  trigger: Trigger;
  env: string | undefined;
  prerelease: boolean;
  interactive: boolean;
  changelogTool: ChangeLogTool;
}
