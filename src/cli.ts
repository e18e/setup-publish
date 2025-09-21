import * as prompts from '@clack/prompts';
import type {Trigger, CLIOptions, ChangeLogTool} from './types.js';
import {generateWorkflow} from './workflow.js';

function cancelInteractive(): never {
  prompts.cancel('✋  Operation cancelled');
  process.exit(0);
}

async function runInteractive(opts: CLIOptions): Promise<CLIOptions> {
  const changeLogTool = await prompts.select<ChangeLogTool>({
    message: 'Select a changelog tool',
    options: [
      {
        value: 'none',
        label: 'None',
        hint: 'GitHub releases will be used (manual creation)'
      },
      {
        value: 'changelogithub',
        label: 'changelogithub',
        hint: 'Automate changelog generation using changelogithub to create GitHub releases'
      },
      {
        value: 'changesets',
        label: 'Changesets',
        hint: 'Automate changelog generation and releases using changesets'
      }
    ],
    initialValue: opts.changelogTool
  });

  if (prompts.isCancel(changeLogTool)) {
    cancelInteractive();
  }

  const availableTriggers: Trigger[] = [];

  switch (changeLogTool) {
    case 'none':
      availableTriggers.push(
        'tag',
        'release_published',
        'release_created',
        'push_main'
      );
      break;
    case 'changelogithub':
      availableTriggers.push(
        'tag',
        'release_published',
        'release_created',
        'push_main'
      );
      break;
    case 'changesets':
      availableTriggers.push('push_main');
      throw new Error('Changesets support not yet implemented');
  }

  const userOptions = await prompts.group(
    {
      output: () =>
        prompts.text({
          message: 'Output file',
          placeholder: opts.output,
          defaultValue: opts.output
        }),
      split: () =>
        prompts.confirm({
          message:
            'Split workflow into multiple stages?\n' +
            'This will create two separate jobs (build and publish) to isolate publishing.',
          initialValue: opts.split
        }),
      'no-scripts': () =>
        prompts.confirm({
          message:
            'Disable scripts?\n' +
            'This will disable scripts from running during install of dependencies.',
          initialValue: opts['no-scripts']
        }),
      trigger: () =>
        prompts.select<Trigger>({
          message: 'Select the trigger for the workflow',
          options: [
            {value: 'release_published', label: 'GitHub Release Published'},
            {value: 'release_created', label: 'GitHub Release Created'},
            {value: 'tag', label: 'Tag Pushed'}
          ],
          initialValue: opts.trigger
        }),
      env: () =>
        prompts.text({
          message:
            'GitHub Environment\n' +
            'If set, this will link the publishing job to a GitHub Environment which allows for required approvals.',
          placeholder: opts.env ?? 'none',
          defaultValue: opts.env ?? ''
        }),
      prerelease: () =>
        prompts.confirm({
          message:
            'Enable pre-releases?\n' +
            'When pre-releases are enabled, a release marked as pre-release will be published under a `next` tag on npm.',
          initialValue: opts.prerelease
        })
    },
    {
      onCancel: cancelInteractive
    }
  );

  return {
    ...opts,
    ...userOptions
  };
}

export async function runCLI(opts: CLIOptions): Promise<void> {
  prompts.intro('🛠️  Setup Publish');

  if (opts.interactive) {
    opts = await runInteractive(opts);
  }

  await generateWorkflow(opts);

  prompts.outro('✨  Workflow generated!');
}
