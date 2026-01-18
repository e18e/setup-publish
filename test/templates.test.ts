import {describe, expect, test, beforeEach, afterEach} from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {getAvailableTemplates, createTemplate} from '../src/templates.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(dirname, './fixtures/basic');

const exists = async (path: string) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

describe('getAvailableTemplates', () => {
  test('should return an array of available templates', async () => {
    const templates = await getAvailableTemplates();
    const expectedTemplates = [
      'changelogithub',
      'changesets',
      'changesets+bun',
      'default',
      'default+bun'
    ];
    expect(templates).toHaveLength(expectedTemplates.length);
    expect(templates).toEqual(expect.arrayContaining(expectedTemplates));
  });
});

describe('createTemplate', () => {
  let outputPath: string;

  beforeEach(async () => {
    await fs.mkdir(templatesDir, {recursive: true});
    outputPath = path.join(templatesDir, 'output.yml');
  });

  afterEach(async () => {
    await fs.rm(templatesDir, {recursive: true, force: true});
  });

  test('does nothing for unknown template', async () => {
    await createTemplate({
      env: undefined,
      template: 'unknown',
      output: 'output.yml',
      interactive: false
    });
    expect(await exists(outputPath)).toBe(false);
  });

  test('copies template file to output', async () => {
    await createTemplate({
      env: undefined,
      template: 'default',
      output: outputPath,
      interactive: false
    });
    expect(await exists(outputPath)).toBe(true);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain('Publish to npm');
  });

  test('sets environment variable if provided', async () => {
    await createTemplate({
      env: 'foo',
      template: 'default',
      output: outputPath,
      interactive: false
    });
    expect(await exists(outputPath)).toBe(true);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain('environment: foo');
  });
});
