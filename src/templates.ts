import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as prompts from '@clack/prompts';
import type {CLIOptions} from './types.js';
import {parse, stringify} from 'yaml';
import {dset} from 'dset';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(dirname, '../templates');
const availableTemplates: string[] = [];
let availableTemplatesPopulated = false;

async function populateAvailableTemplates(arr: string[]): Promise<void> {
  const files = await fs.readdir(templatesDir);
  for (const file of files) {
    if (file.endsWith('.yml')) {
      arr.push(path.basename(file, '.yml'));
    }
  }
}

export async function getAvailableTemplates(): Promise<string[]> {
  if (!availableTemplatesPopulated) {
    await populateAvailableTemplates(availableTemplates);
    availableTemplatesPopulated = true;
  }
  return availableTemplates;
}

export async function createTemplate(opts: CLIOptions): Promise<void> {
  const templates = await getAvailableTemplates();

  // Shouldn't ever happen but just in case
  if (!templates.includes(opts.template)) {
    prompts.log.error(`❌ Template for current configuration not found`);
    return;
  }

  if (opts.pm && !templates.includes(`${opts.template}+${opts.pm}`)) {
    prompts.log.warn(`⚠️ Template for your package manager does not exist. Falling back to npm`);
    opts.pm = '';
  }

  const templatePath = opts.pm
    ? path.join(templatesDir, `${opts.template}.yml`)
    : path.join(templatesDir, `${opts.template}+${opts.pm}.yml`);

  let templateContent: string;

  try {
    templateContent = await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    prompts.log.error(
      `❌ Failed to read template: ${(error as Error).message}`
    );
    return;
  }

  if (opts.env) {
    const parsed = parse(templateContent) as Record<string, unknown>;
    dset(parsed, 'jobs.publish.environment', opts.env);
    templateContent = stringify(parsed, {indent: 2});
  }

  try {
    await fs.writeFile(opts.output, templateContent);
  } catch (error) {
    prompts.log.error(
      `❌ Failed to write template to ${opts.output}: ${(error as Error).message}`
    );
    return;
  }
}
