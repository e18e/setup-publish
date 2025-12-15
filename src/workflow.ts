import {stringify} from 'yaml';
import type {CLIOptions} from './types.js';
import {writeFile, mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import * as prompts from '@clack/prompts';
import {createTemplate} from './templates.js';

export async function generateWorkflow(opts: CLIOptions): Promise<void> {
  const spinner = prompts.spinner();
  spinner.start('Generating workflow...');
  const template = createTemplate(opts);
  spinner.message('Writing workflow file...');
  const yamlContents = stringify(template, {indent: 2});
  const outputDir = dirname(opts.output);
  await mkdir(outputDir, {recursive: true});
  await writeFile(opts.output, yamlContents);
  spinner.stop('Workflow file written successfully');
}
