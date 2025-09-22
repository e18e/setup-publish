import * as prompts from '@clack/prompts';
import type {CLIOptions} from './types.js';
import {generateWorkflow} from './workflow.js';
import {x} from 'tinyexec';
import {getAvailableTemplates} from './templates.js';

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
  const template = await prompts.select({
    message: 'Select a changelog tool',
    options: [
      {
        value: 'default',
        label: 'Default',
        hint: 'Manual GitHub release management'
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
    initialValue: opts.template
  });

  if (prompts.isCancel(template)) {
    cancelInteractive();
  }

  if (template === 'changelogithub') {
    await setupChangelogithub();
  }
  if (template === 'changesets') {
    await setupChangeSets();
  }

  const userOptions = await prompts.group(
    {
      output: () =>
        prompts.text({
          message: 'Output file',
          placeholder: opts.output,
          defaultValue: opts.output
        }),
      env: () =>
        prompts.text({
          message:
            'GitHub Environment\n' +
            'If set, this will link the publishing job to a GitHub Environment which allows for required approvals.',
          placeholder: opts.env ?? 'none',
          defaultValue: opts.env ?? ''
        })
    },
    {
      onCancel: cancelInteractive
    }
  );

  return {
    ...opts,
    template,
    ...userOptions
  };
}

export async function runCLI(opts: CLIOptions): Promise<void> {
  prompts.intro('🛠️  Setup Publish');

  const availableTemplatesResult = getAvailableTemplates();

  if (opts.interactive) {
    opts = await runInteractive(opts);
  }

  const availableTemplates = await availableTemplatesResult;

  if (!availableTemplates.includes(opts.template)) {
    prompts.log.error('❌  Unknown template selected.');
    process.exit(1);
  }

  await generateWorkflow(opts);

  prompts.outro('✨  Workflow generated!');
}
