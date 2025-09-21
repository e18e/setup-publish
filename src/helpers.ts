import type {ChangeLogTool, Trigger} from './types.js';

export function getAvailableTriggersForChangelog(
  tool: ChangeLogTool
): Trigger[] {
  switch (tool) {
    case 'none':
      return ['tag', 'release_published', 'release_created', 'push_main'];
    case 'changelogithub':
      return ['tag', 'release_published', 'release_created', 'push_main'];
    case 'changesets':
      return ['push_main'];
  }
}

const validTriggers: Trigger[] = [
  'release_published',
  'release_created',
  'tag',
  'push_main'
];
const validChangelogTools: ChangeLogTool[] = [
  'changelogithub',
  'changesets',
  'none'
];

export function isValidChangeLogTool(tool: string): tool is ChangeLogTool {
  return validChangelogTools.includes(tool as ChangeLogTool);
}

export function isValidTrigger(trigger: Trigger): boolean {
  return validTriggers.includes(trigger as Trigger);
}
