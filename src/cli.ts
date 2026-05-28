import * as prompts from '@clack/prompts';
import type {CLIOptions} from './types.js';
import {generateWorkflow} from './workflow.js';
import {x} from 'tinyexec';
import {getAvailableTemplates} from './templates.js';
import {styleText} from 'node:util';

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

const defaultTemplateSummary = `
${styleText('green', 'GitHub releases are now configured to be managed manually.')}

${styleText('bold', 'To create a new release, follow these steps:')}

${styleText('cyan', '1.')} Tag the ${styleText('yellow', '`main`')} branch with the new semantic version:

${styleText('gray', '$')} ${styleText('blue', 'git checkout main')}
${styleText('gray', '$')} ${styleText('blue', 'git pull')}
${styleText('gray', '$')} ${styleText('blue', 'git tag vX.Y.Z')} ${styleText('gray', '# Replace X.Y.Z with the new version number')}
${styleText('gray', '$')} ${styleText('blue', 'git push origin vX.Y.Z')}

${styleText('cyan', '2.')} Create a new release on GitHub (GitHub will automatically populate this with a changelog based on merged PRs).

${styleText('cyan', '3.')} ${styleText('dim', '(Optional)')} If you want this to be a pre-release, check the ${styleText('yellow', '"Set as pre-release"')} option.

${styleText('cyan', '4.')} Publish the release!

${styleText('green', 'The workflow will now be triggered and will stage the release on npm. Visit the npm staging page to approve and publish it.')}
`;

const changelogithubTemplateSummary = `
${styleText('green', 'GitHub releases are now configured to be managed using changelogithub.')}

${styleText('bold', 'To create a new release, follow these steps:')}

${styleText('cyan', '1.')} Tag the ${styleText('yellow', '`main`')} branch with the new semantic version:

${styleText('gray', '$')} ${styleText('blue', 'git checkout main')}
${styleText('gray', '$')} ${styleText('blue', 'git pull')}
${styleText('gray', '$')} ${styleText('blue', 'git tag vX.Y.Z')} ${styleText('gray', '# Replace X.Y.Z with the new version number')}
${styleText('gray', '$')} ${styleText('blue', 'git push origin vX.Y.Z')}

${styleText('dim', 'NOTE')} If you want this to be a pre-release, use a pre-release semantic version such as ${styleText('yellow', 'vX.Y.Z-beta.0')}.

${styleText('green', 'Changelogithub will automatically create a GitHub release, and the package will be staged on npm. Visit the npm staging page to approve and publish it.')}
`;

const changesetsTemplateSummary = `
${styleText('green', 'GitHub releases are now configured to be managed using Changesets.')}

${styleText('bold', 'To create a new release, follow these steps:')}

${styleText('cyan', '1.')} Create a changeset describing the changes in this release:

${styleText('gray', '$')} ${styleText('blue', 'npx changeset')}
${styleText('dim', '# Follow the prompts to describe the changes and set the version bump (major, minor, patch)')}

${styleText('cyan', '2.')} Commit the changeset file and open a pull request to merge it into ${styleText('yellow', '`main`')}.

${styleText('cyan', '3.')} Once the PR is merged, changesets will automatically create a release pull request. Review and merge this PR to create a new GitHub release and publish to npm.

${styleText('green', 'The workflow will now be triggered and will automatically publish to npm.')}
`;

const templateSummaries: Record<string, string> = {
  default: defaultTemplateSummary,
  changelogithub: changelogithubTemplateSummary,
  changesets: changesetsTemplateSummary
};

async function runInteractive(opts: CLIOptions): Promise<CLIOptions> {
  const pm = await prompts.select({
    message: 'What package manager do you use?',
    options: [
      {
        value: '',
        label: 'npm'
      },
      {
        value: 'pnpm',
        label: 'pnpm'
      },
      {
        value: 'bun',
        label: 'Bun'
      }
    ],
    initialValue: opts.pm
  });

  if (prompts.isCancel(pm)) {
    cancelInteractive();
  }

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
            'If set, this will link the publishing job to a GitHub Environment which allows for required approvals in GitHub.',
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
    pm,
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

  const templateSummary = templateSummaries[opts.template];
  if (templateSummary) {
    prompts.box(templateSummary, 'Summary', {});
  }
}
