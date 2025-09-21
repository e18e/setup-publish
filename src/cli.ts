import * as prompts from '@clack/prompts';
import type {Trigger, CLIOptions} from './types.js';
import {generateWorkflow} from './workflow.js';

function cancelInteractive(): never {
  prompts.cancel('✋  Operation cancelled');
  process.exit(0);
}

async function runInteractive(opts: CLIOptions): Promise<CLIOptions> {
  const changesets = await prompts.confirm({
    message:
      'Use Changesets for versioning and publishing?\n' +
      'This will set up the workflow to publish using Changesets rather than GitHub releases.',
    initialValue: opts.changesets
  });

  if (prompts.isCancel(changesets)) {
    cancelInteractive();
  }

  if (changesets) {
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
