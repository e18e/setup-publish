import sade from 'sade';
import {runCLI} from './cli.js';

const cli = sade('@e18e/setup-publish', true);
const CLI_VERSION = '0.0.0-dev';

/*
 * - changesets
 * - split workflow
 * - disable scripts
 * - trigger?
 * - use an environment?
 * - pre-releases?
 */

cli.version(CLI_VERSION);

cli
  .describe('Generate a publish workflow for your project.')
  .option(
    '-o, --output',
    'Change the name of the output file',
    '.github/workflows/publish.yml'
  )
  .option('--split', 'Split the workflow into multiple jobs', true)
  .option('--no-scripts', 'Disable running scripts before publishing', true)
  .option(
    '--trigger',
    'Change the event that triggers the workflow',
    'release_published'
  )
  .option('--env', 'Set the environment for the workflow')
  .option('--prerelease', 'Support publishing pre-releases', false)
  .option('--interactive', 'Run the CLI in interactive mode', true)
  .option('--changelog', 'Generate changelogs using a tool', 'none')
  .action(runCLI);

cli.parse(process.argv);
