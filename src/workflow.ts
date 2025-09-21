import {stringify} from 'yaml';
import type {CLIOptions} from './types.js';
import {writeFile} from 'node:fs/promises';
import {createTemplate} from './templates.js';
import * as prompts from '@clack/prompts';

export async function generateWorkflow(opts: CLIOptions): Promise<void> {
  const spinner = prompts.spinner();
  spinner.start('Generating workflow...');
  const template = createTemplate(opts);
  spinner.message('Writing workflow file...');
  const yamlContents = stringify(template, {indent: 2});
  await writeFile(opts.output, yamlContents);
  spinner.stop('Workflow generated!');
}
