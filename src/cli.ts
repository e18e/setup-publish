import * as prompts from '@clack/prompts';
import type {Trigger, CLIOptions, ChangeLogTool} from './types.js';
import {generateWorkflow} from './workflow.js';
import {x} from 'tinyexec';
import {
  getAvailableTriggersForChangelog,
  isValidTrigger,
  isValidChangeLogTool
} from './helpers.js';

function cancelInteractive(): never {
  prompts.cancel('✋  Operation cancelled');
  process.exit(0);
}

async function setupChangeSets(): Promise<void> {
  const shouldInstall = await prompts.confirm({
    message:
      'To use Changesets, the "@changesets/cli" npm package must be installed. Install now?',
    initialValue: true
  });

  if (prompts.isCancel(shouldInstall)) {
    cancelInteractive();
  }

  if (shouldInstall) {
    const taskLog = prompts.taskLog({
      title: 'Installing @changesets/cli...',
      limit: 4
    });
    try {
      const proc = x('npm', ['install', '--save-dev', '@changesets/cli']);
      for await (const line of proc) {
        taskLog.message(line);
      }
      taskLog.success('✅  @changesets/cli installed successfully');
    } catch (error) {
      taskLog.error(
        '❌  Failed to install @changesets/cli. Please install it manually and re-run the setup.'
      );
      prompts.log.error(`Error was: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  const initChangesets = await prompts.confirm({
    message: 'Initialize Changesets in this repository?',
    initialValue: true
  });

  if (prompts.isCancel(initChangesets)) {
    cancelInteractive();
  }

  if (initChangesets) {
    const taskLog = prompts.taskLog({
      title: 'Initializing Changesets...',
      limit: 4
    });
    try {
      const proc = x('npx', ['changeset', 'init']);
      for await (const line of proc) {
        taskLog.message(line);
      }
      taskLog.success('✅  Changesets initialized successfully');
    } catch (error) {
      taskLog.error(
        '❌  Failed to initialize Changesets. Please run "npx changeset init" manually and re-run the setup.'
      );
      prompts.log.error(`Error was: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

async function setupChangelogithub(): Promise<void> {
  const shouldInstall = await prompts.confirm({
    message:
      'To use changelogithub, the "changelogithub" npm package must be installed. Install now?',
    initialValue: true
  });

  if (prompts.isCancel(shouldInstall)) {
    cancelInteractive();
  }

  if (shouldInstall) {
    const taskLog = prompts.taskLog({
      title: 'Installing changelogithub...',
      limit: 4
    });
    try {
      const proc = x('npm', ['install', '--save-dev', 'changelogithub']);
      for await (const line of proc) {
        taskLog.message(line);
      }
      taskLog.success('✅  changelogithub installed successfully');
    } catch (error) {
      taskLog.error(
        '❌  Failed to install changelogithub. Please install it manually and re-run the setup.'
      );
      prompts.log.error(`Error was: ${(error as Error).message}`);
      process.exit(1);
    }
  }
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
    initialValue: opts.changelog
  });

  if (prompts.isCancel(changeLogTool)) {
    cancelInteractive();
  }

  const availableTriggers = getAvailableTriggersForChangelog(changeLogTool);

  if (changeLogTool === 'changelogithub') {
    await setupChangelogithub();
  }
  if (changeLogTool === 'changesets') {
    await setupChangeSets();
  }

  const triggerOptions: prompts.Option<Trigger>[] = [
    {value: 'release_published', label: 'GitHub Release Published'},
    {value: 'release_created', label: 'GitHub Release Created'},
    {value: 'tag', label: 'Tag Pushed'},
    {value: 'push_main', label: 'Push to Main Branch'}
  ];

  const preReleaseSupported = changeLogTool !== 'changesets';

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
          options: triggerOptions.filter((option) =>
            availableTriggers.includes(option.value)
          ),
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
      prerelease: () => {
        if (!preReleaseSupported) {
          return Promise.resolve(false);
        }
        return prompts.confirm({
          message:
            'Enable pre-releases?\n' +
            'When pre-releases are enabled, a release marked as pre-release will be published under a `next` tag on npm.',
          initialValue: opts.prerelease
        });
      }
    },
    {
      onCancel: cancelInteractive
    }
  );

  return {
    ...opts,
    changelog: changeLogTool,
    ...userOptions
  };
}

export async function runCLI(opts: CLIOptions): Promise<void> {
  prompts.intro('🛠️  Setup Publish');

  if (opts.interactive) {
    opts = await runInteractive(opts);
  }

  if (!isValidTrigger(opts.trigger)) {
    prompts.log.error('❌  Invalid trigger option provided.');
    process.exit(1);
  }

  const availableTriggers = getAvailableTriggersForChangelog(opts.changelog);

  if (!availableTriggers.includes(opts.trigger)) {
    prompts.log.error(
      `❌  The selected changelog tool "${opts.changelog}" is not compatible with the "${opts.trigger}" trigger.`
    );
    process.exit(1);
  }

  if (!isValidChangeLogTool(opts.changelog)) {
    prompts.log.error('❌  Invalid changelog tool option provided.');
    process.exit(1);
  }

  if (opts.changelog === 'changesets' && opts.split) {
    prompts.log.warn(
      '⚠️  Changesets cannot currently be used with split workflows. Disabling split workflow.'
    );
    opts.split = false;
  }

  await generateWorkflow(opts);

  prompts.outro('✨  Workflow generated!');
}
