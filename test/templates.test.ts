import {describe, expect, test, beforeEach, afterEach, vi} from 'vitest';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as prompts from '@clack/prompts';
import {getAvailableTemplates, createTemplate} from '../src/templates.js';

vi.mock('@clack/prompts', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    message: vi.fn(),
    step: vi.fn()
  }
}));

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
      'changelogithub+bun',
      'changelogithub+pnpm',
      'changesets',
      'changesets+bun',
      'changesets+pnpm',
      'default',
      'default+bun',
      'default+pnpm',
      'uppt'
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
    vi.clearAllMocks();
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
    expect(vi.mocked(prompts.log.error).mock.calls).toMatchSnapshot();
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
    expect(vi.mocked(prompts.log.error).mock.calls).toMatchSnapshot();
    expect(vi.mocked(prompts.log.warn).mock.calls).toMatchSnapshot();
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
    expect(vi.mocked(prompts.log.error).mock.calls).toMatchSnapshot();
    expect(vi.mocked(prompts.log.warn).mock.calls).toMatchSnapshot();
  });

  test('works for Bun', async () => {
    await createTemplate({
      env: undefined,
      template: 'default',
      pm: 'bun',
      output: outputPath,
      interactive: false
    });
    expect(await exists(outputPath)).toBe(true);
    const content = await fs.readFile(outputPath, 'utf-8');
    expect(content).toContain('Setup Bun');
    expect(vi.mocked(prompts.log.error).mock.calls).toMatchSnapshot();
    expect(vi.mocked(prompts.log.warn).mock.calls).toMatchSnapshot();
  });

  test('warns and falls back when pm template missing', async () => {
    await createTemplate({
      env: undefined,
      template: 'default',
      pm: 'yarn',
      output: outputPath,
      interactive: false
    });
    expect(vi.mocked(prompts.log.warn).mock.calls).toMatchSnapshot();
  });
});
